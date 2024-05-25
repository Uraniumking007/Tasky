import { registerUser } from "../action";
import RegistrationForm from "./_components/registration-form";

export default function RegisterPage() {
  return <RegistrationForm registerUser={registerUser} />;
}
