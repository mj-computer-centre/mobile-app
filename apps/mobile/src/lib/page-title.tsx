import Head from 'expo-router/head';

const SITE_NAME = 'Mishra Computer Centre';

/**
 * The browser tab's title and the page's description, for the website. Renders nothing on a
 * phone. Expo Router applies it only while the screen is the one in view, so each page sets
 * its own.
 */
export function PageTitle({ title, description }: { title?: string; description?: string }) {
  return (
    <Head>
      <title>{title ? `${title} | ${SITE_NAME}` : SITE_NAME}</title>
      {description ? <meta name="description" content={description} /> : null}
    </Head>
  );
}
