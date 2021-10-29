import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';
import Post from './post/[slug]';
import commonStyles from '../styles/common.module.scss';
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
  // TODO

  console.log('results', results);
  return (
    <div className={styles.wrapper}>
      <h1>Home</h1>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  // title: string;
  // banner: {
  //   url: string;
  // }
  // author: string;
  // content: {
  //   heading: string;
  //   body: {
  //     text: string;
  //   }
  //   [];
  // }
  // [];

  // const fullPosts = results.map(async post => {
  //   const fullPost = await prismic.getByUID('posts', post.uid, {
  //     fetch: ['posts.title'],
  //   });

  //   console.log('fullPost', fullPost);

  //   return fullPost;
  // });

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
