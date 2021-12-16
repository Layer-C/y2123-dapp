type Props = {
  children: React.ReactNode;
};

export default function Prose({ children }: Props) {
  return <div className="max-w-prose mx-auto pl-72 pt-12">{children}</div>;
}
