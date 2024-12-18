"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME } from "@/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/features/Users/userSlice";
import { Spinner } from "@/components/Loaders/Spinner";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState({});

  const dispatch = useDispatch();
  const { status, error, loading } = useSelector((state) => state.user);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUserData({
      email,
      password,
    });
    dispatch(loginUser(userData));
    if (error) {
      toast({
        title: "Uh!Something went wrong",
        description: error,
        duration: 3000,
      });
    }
    if (status == "succeeded") {
      router.push("/user-dashboard");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="p-7">
        <h1 className="font-bold text-white text-4xl">{PRODUCT_NAME}</h1>
      </div>
      <div className="p-7 ">
        {/* <h1 className="font-bold text-white text-xl">Sign in as User</h1> */}
        <Card className="mt-10 mx-auto max-w-lg bg-black text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Signin as User</CardTitle>
            <CardDescription>
              Enter your email and password to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Button
                onClick={handleSubmit}
                type="submit"
                disabled={loading}
                className="mt-5 w-full"
              >
                {loading ? <Spinner /> : "Login"}
              </Button>
              <p className="text-center">
                New here?{" "}
                <Link href="/signup" className="text-blue-600">
                  Create new Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
