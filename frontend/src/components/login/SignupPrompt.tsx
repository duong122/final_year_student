import { Link } from "react-router-dom";

export const SignupPrompt = () => {
  return (
    <div className="relative items-center bg-transparent box-border caret-transparent flex flex-col shrink-0 py-2.5 rounded-[1px] md:bg-white">
      <span className="relative text-neutral-500 caret-transparent block max-w-full break-words before:accent-auto before:caret-transparent before:text-neutral-500 before:block before:text-sm before:not-italic before:normal-nums before:font-normal before:h-0 before:tracking-[normal] before:leading-[18px] before:list-outside before:list-disc before:mt-[-3px] before:break-words before:text-start before:indent-[0px] before:normal-case before:visible before:border-separate before:font-apple_system after:accent-auto after:caret-transparent after:text-neutral-500 after:block after:text-sm after:not-italic after:normal-nums after:font-normal after:h-0 after:tracking-[normal] after:leading-[18px] after:list-outside after:list-disc after:break-words after:text-start after:indent-[0px] after:normal-case after:visible after:-mb-1 after:border-separate after:font-apple_system">
        <p className="text-black caret-transparent break-words text-center m-[15px]">
          Don&#39;t have an account?
          <Link
            to="/register"
            role="link"
            className="text-indigo-600 box-border caret-transparent list-none break-words hover:text-indigo-700 ml-1"
          >
            <span className="font-semibold caret-transparent max-w-full break-words">
              Sign up
            </span>
          </Link>
        </p>
      </span>
    </div>
  );
};