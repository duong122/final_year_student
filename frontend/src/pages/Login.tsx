import { LoginPage } from "../components/login/LoginPage";
import { Footer } from "../components/footer/Footer";

export default function Login() {
  return (
    <div className="text-black text-sm not-italic normal-nums font-normal accent-auto bg-white caret-transparent block h-full tracking-[normal] leading-[18px] list-outside list-disc text-start indent-[0px] normal-case visible border-separate font-apple_system">
      <div className="caret-transparent">
        <div className="caret-transparent">
          <div className="caret-transparent">
            <div className="fixed caret-transparent hidden z-[12] top-0 inset-x-0">
              <div className="fixed caret-transparent h-[3px] origin-[100%_50%] w-full z-[12] top-0 inset-x-0">
                <div className="bg-[linear-gradient(to_right,rgb(118,56,250),rgb(255,214,0),rgb(255,122,0),rgb(255,1,105),rgb(211,0,197),rgb(118,56,250),rgb(255,214,0))] caret-transparent h-[3px] origin-[100%_50%] w-full"></div>
              </div>
            </div>
            <div className="relative box-border caret-transparent z-0">
              <div className="relative caret-transparent flex flex-col z-0">
                <div className="relative caret-transparent flex flex-col min-h-[1000px] top-0">
                  <div className="relative caret-transparent flex flex-col mb-[-1000px] min-h-[1000px] z-0">
                    <div className="items-stretch bg-white box-border caret-transparent flex flex-col shrink-0 h-full justify-between md:flex-row">
                      <div className="caret-transparent grow max-h-[calc(100%_-_50px)] w-full md:grow-0 md:max-h-none">
                        <section className="caret-transparent flex flex-col grow min-h-[1000px]">
                          <main
                            role="main"
                            className="bg-white caret-transparent flex flex-col grow justify-center"
                          >
                            <LoginPage />
                          </main>
                          <Footer />
                        </section>
                      </div>
                    </div>
                    <div className="caret-transparent">
                      <div className="caret-transparent"></div>
                    </div>
                  </div>
                  <div className="caret-transparent">
                    <div className="caret-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="caret-transparent hidden"></div>
      <div className="caret-transparent">
        <div className="fixed caret-transparent z-[500] overflow-hidden bottom-0 inset-x-0">
          <div className="[align-items:normal] caret-transparent md:items-center"></div>
        </div>
        <div className="fixed items-center caret-transparent z-[500] overflow-hidden bottom-2/4 inset-x-0">
          <div className="caret-transparent w-fit m-auto"></div>
        </div>
        <div className="caret-transparent">
          <div className="caret-transparent"></div>
        </div>
      </div>
    </div>
  );
};
