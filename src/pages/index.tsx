import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<string | null>('');

  useEffect(() => {
    setPosts(results);
    setNextPage(next_page);
  }, [results, next_page]);

  function handlePagination(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const nextPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
        setPosts([...posts, ...nextPosts]);
        setNextPage(data.next_page);
      });
  }

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>
      {posts.map(({ uid: slug, first_publication_date, data }) => (
        <Link href={`/post/${slug}`} as={`/post/${slug}`} key={slug}>
          <div className={styles.postContainer}>
            <h2 className={styles.postTitle}>{data.title}</h2>
            <p className={styles.postSubtitle}>{data.subtitle}</p>
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
            </div>
          </div>
        </Link>
      ))}
      {nextPage && (
        <button
          className={styles.loadMore}
          type="button"
          onClick={handlePagination}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    }
  );

  const posts = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
    },
  };
};
