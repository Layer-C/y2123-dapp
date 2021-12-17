import Head from 'next/head';
import { useRouter } from 'next/router';

type Props = {
  pageTitle?: string;
};

const meta = {
  description: `${process.env.NEXT_PUBLIC_NFT_NAME} is an NFT collection game theory.`,
  ogImagePath: '/assets/card-image.png',
};

export default function Meta({ pageTitle }: Props) {
  const router = useRouter();
  const ogUrl = process.env.NEXT_PUBLIC_SITE_URL + router.asPath;
  const ogType = router.pathname === '/' ? 'website' : 'article';
  const ogTitle = pageTitle
    ? pageTitle
    : 'Y2123 Game Theory';
  const ogImage = process.env.NEXT_PUBLIC_SITE_URL + meta.ogImagePath;

  return (
    <Head>
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="theme-color" content="#ffffff" />
      <title>{`${pageTitle} | ${process.env.NEXT_PUBLIC_NFT_NAME}`}</title>
      <meta name="msapplication-TileColor" content="#ffc40d" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <meta name="description" content={meta.description} key="description" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={ogType} />
      <meta
        property="og:site_name"
        content={process.env.NEXT_PUBLIC_NFT_NAME}
      />
      <meta property="og:title" content={ogTitle} />
      <meta
        property="og:description"
        content={meta.description}
        key="ogDescription"
      />
      <meta property="og:image" content={ogImage} key="ogImage" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:site"
        content={process.env.NEXT_PUBLIC_TWITTER_USERNAME}
      />
    </Head>
  );
}
