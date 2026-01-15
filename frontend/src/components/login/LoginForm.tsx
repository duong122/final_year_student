import { LoginHeader } from "./LoginHeader";
import { SignupPrompt } from "./SignupPrompt";

export const LoginForm = () => {
  return (
    <div className="caret-transparent flex flex-col grow justify-between max-w-full w-full mt-0 md:justify-center md:max-w-[350px] md:mt-3">
      <LoginHeader />
      <SignupPrompt />
    </div>
  );
};
