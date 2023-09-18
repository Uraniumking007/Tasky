import React, { useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";
import { Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
// import { MailIcon } from "./MailIcon.jsx";
// import { LockIcon } from "./LockIcon.jsx";

export default function LoginModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  function handleLogin() {
    console.log("Login");
    void signIn("credentials", {
      email: loginData.email,
      password: loginData.password,
      callbackUrl: `${window.location.origin}/tasks`,
      redirect: false,
    });
  }

  return (
    <>
      <Button onPress={onOpen} color="primary">
        Login
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  endContent={
                    <Mail className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
                  }
                  label="Email"
                  placeholder="Enter your email"
                  variant="bordered"
                  defaultValue={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value });
                  }}
                />
                <Input
                  endContent={
                    <Lock className="pointer-events-none flex-shrink-0 text-2xl text-default-400" />
                  }
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
                  defaultValue={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                  }}
                />
                <div className="flex justify-between px-1 py-2 ">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                  >
                    <span className="text-content2">Remember me</span>
                  </Checkbox>
                  <Link color="primary" href="#" size="sm">
                    Forgot password?
                  </Link>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleLogin();
                    onClose();
                  }}
                >
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
