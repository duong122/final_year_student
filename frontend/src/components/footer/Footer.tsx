import { FooterLinks } from "./FooterLinks";

export const Footer = () => {
  return (
    <footer
      role="contentinfo"
      className="relative items-stretch bg-white box-border caret-transparent flex flex-col shrink-0 order-5 px-4"
    >
      <FooterLinks />
    </footer>
  );
};
