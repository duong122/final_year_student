import { LoginInputs } from "./LoginInput";

export const LoginHeader = () => {
  return (
    <div className="relative items-center bg-transparent box-border caret-transparent flex flex-col shrink-0 mb-2.5 py-2.5 rounded-[1px] md:bg-white">
      <div className="relative items-stretch box-border caret-transparent flex flex-col shrink-0 justify-start mt-9 mb-3">
        <h1 className="text-3xl font-semibold text-zinc-900 caret-transparent italic tracking-wide">
          Linkly
        </h1>
      </div>
      <div className="caret-transparent max-w-[350px] w-full mb-3">
        <div className="caret-transparent">
          <LoginInputs />
        </div>
      </div>
    </div>
  );
};
