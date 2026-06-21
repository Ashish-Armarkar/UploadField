import { FormProvider, useForm } from "react-hook-form";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import UploadField from "./components/UploadField";
import { ToastContainer } from "react-toastify";
import Buttons from "./components/Buttons";
import { useCallback, useState } from "react";

function App() {
  const [isLoading, setIsloading] = useState(false);
  const methods = useForm();
  const { handleSubmit } = methods;
  const callSubmit = useCallback((data: any) => {
    console.log(data);
  }, []);
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <FormProvider {...methods}>
        <form action="" onSubmit={handleSubmit(callSubmit)}>
          <div className="row d-flex justify-content-center align-items-center gap-3">
            <div className="col-3">
              <UploadField
                name="upload"
                label="Uplod Field"
                required
                maxItems={Infinity}
                parentLoading={(loading) => setIsloading(loading)}
              />
            </div>
            <div className="w-100 d-flex justify-content-center align-items-center">
              <Buttons
                type="submit"
                label="Submit"
                isDisabled={false}
                isLoading={isLoading}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
}

export default App;
