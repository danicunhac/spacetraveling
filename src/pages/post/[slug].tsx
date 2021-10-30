import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>Carregando...</div>
      </div>
    );
  }

  const { data, first_publication_date } = post;

  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, content) => [...acc, ...content.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, content) => {
    if (content.heading) {
      return [...acc, ...content.heading.split(' ')];
    }

    return [...acc];
  }, []).length;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>{post.data.title} | Space Traveling</title>
      </Head>
      <img src={data.banner.url} alt="Banner" />
      <div className={styles.content}>
        <h1>{data.title}</h1>
        <h2>{data.subtitle}</h2>
        <div className={styles.postInfo}>
          <span>
            <FiCalendar size={20} />
            {format(new Date(first_publication_date), 'dd MMM yyy', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FiUser size={20} />
            {data.author}
          </span>
          <span>
            <FiClock size={20} />
            {readingTime} min
          </span>
        </div>
        <div className={styles.postContent}>
          {data.content.map(({ heading, body }) => {
            return (
              <div key={heading || `${body}`}>
                {heading && <h3>{heading}</h3>}
                <div
                  className={styles.postBody}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 2,
    }
  );

  const paths = response.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  // TODO

  return {
    props: {
      post,
    },
    revalidate: 60 * 30,
  };
};
