import { FormProvider, useForm } from "react-hook-form";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import UploadField from "./components/UploadField";
import { ToastContainer } from "react-toastify";
import Buttons from "./components/Buttons";
import { useCallback, useState } from "react";
import useToast from "./Hooks/useToast";

function App() {
  const [isLoading, setIsloading] = useState(false);
  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const toast = useToast();
  const callSubmit = useCallback((data: any) => {
    setIsloading(true);
    console.log(data);
    toast({
      message:
        "Data submitted successfully! Please check the browser console to view the submitted data.",
      status: "success",
    });
    reset();
  }, []);
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <FormProvider {...methods}>
        <form action="" onSubmit={handleSubmit(callSubmit)}>
          <div
            className="row d-flex justify-content-center  gap-3"
            style={{
              height: "calc(100vh)",
            }}
          >
            <div
              className="w-50 d-flex align-items-center"
              style={{ height: "90%" }}
            >
              <UploadField
                name="upload"
                label="Uplod Field"
                required
                maxItems={Infinity}
                parentLoading={(loading) => setIsloading(loading)}
              />
            </div>
            <div className="w-100 d-flex justify-content-end p-4">
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
