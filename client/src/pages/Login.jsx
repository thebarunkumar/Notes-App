import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Google from "../assets/googleLogo.png"

import axios from "axios"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/authSlice"
import { toast } from "sonner"
const API_URL = import.meta.env.VITE_API_URL;


const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    try {
      setIsLoading(true)
  const res = await axios.post(`${API_URL}/api/v1/user/login`, formData, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      })
      if (res.data.success) {
        const { accessToken, refreshToken } = res.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        navigate('/')
        dispatch(setUser(res.data.data))
        toast.success(res.data.message);

      }
    } catch (error) {
      console.log(error);
      setError(error.response.data.message)
    } finally {
      setIsLoading(false)
    }

  };

  return (

    <div className="relative w-full h-screen md:h-[760px] bg-lightGray overflow-hidden">
      <div className="min-h-screen flex flex-col to-muted/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-primaryBlue">Welcome back</h1>
              <p className="text-gray-600">Sign in to your account to continue taking notes</p>
            </div>

            <Card className="bg-white">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center text-primaryBlue">Log In</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and password to access your notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className='relative'
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-800">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className=''
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}

                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                      </Button>
                    </div>
                    {/* <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p> */}
                    <Link to={'/forgot-password'} className="text-primaryBlue hover:underline relative text-sm">Forgot password?</Link>
                  </div>

                  <Button type="submit" className="w-full border border-gray-200 bg-primaryBlue hover:bg-blue-500 cursor-pointer relative" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging account...
                      </>
                    ) : (
                      "Log Into Account"
                    )}
                  </Button>
                  <Button className='w-full' variant="outline" onClick={() => window.open(`${API_URL}/auth/google`, "_self") }>
                    <img src={Google} alt="" className="w-5" /> Login with Google
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link to="/signup" className="text-primaryBlue hover:underline font-medium relative">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
