import Header from './Header';
import Meta from './Meta';
import Image from 'next/image'
import bgImage from '../public/assets/bg.jpg';

type Props = {
  children: React.ReactNode;
  pageTitle?: string;
};

export default function Layout({ children, pageTitle }: Props) {
  return (
    <>
      <Meta pageTitle={pageTitle} />
      <div className="z-0">
        <Image
          alt={process.env.NEXT_PUBLIC_NFT_NAME}
          src={bgImage}
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <Header />
      <div className="sticky z-50">
        <main>{children}</main>
      </div>
    </>
  );
}
