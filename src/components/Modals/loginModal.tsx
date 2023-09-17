import React, { useState } from "react";

import { Eye, EyeOff } from "lucide-react";
import {
  type useDisclosure,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

const LoginModal = ({
  isOpen,
  onOpen,
  onOpenChange,
}: Partial<ReturnType<typeof useDisclosure>>) => {
  // const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const data = signIn("credentials", {
      email: loginData.email,
      password: loginData.password,
      callbackUrl: `${window.location.origin}/tasks`,
      redirect: false,
    });

    await data.then((res) => {
      if (res?.status === 401) {
        setError("Invalid Email or Password");
      }
      if (res?.status === 200) {
        void router.push("/tasks");
      }
    });
  };

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  return (
    <>
      <Button onPress={onOpen}>Login</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Login</ModalHeader>
              <ModalBody>
                <Input
                  type="email"
                  variant={"bordered"}
                  label="Email"
                  placeholder="Enter your email"
                  defaultValue={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value });
                  }}
                />

                <Input
                  label="Password"
                  variant="bordered"
                  placeholder="Enter your password"
                  defaultValue={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                  }}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <Eye className="pointer-events-none text-2xl text-default-400" />
                      ) : (
                        <EyeOff className="pointer-events-none text-2xl text-default-400" />
                      )}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => void handleLogin()}>
                  Login
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginModal;
