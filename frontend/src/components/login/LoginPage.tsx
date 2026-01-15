import { LoginImage } from "./LoginImage";
import { LoginForm } from "./LoginForm";

export const  LoginPage = () => {
  return (
    <article className="items-stretch box-border caret-transparent flex grow shrink-0 justify-center max-w-[935px] w-full mt-0 mx-auto pb-8 md:mt-8">
      <LoginImage />
      <LoginForm />
    </article>
  );
};