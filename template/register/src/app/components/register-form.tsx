import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export function RegisterForm() {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      toast.success(`Mã OTP đã được gửi đến ${formData.email}`);
      // In a real app, the OTP would be sent via email
      // For demo purposes, the correct OTP is "123456"
      console.log('Demo OTP: 123456');
    }, 1500);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, accept "123456" as valid OTP
      if (otp === '123456') {
        toast.success('Đăng ký tài khoản thành công!', {
          description: `Chào mừng ${formData.name}!`,
        });
        // Reset form
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setOtp('');
        setStep('register');
      } else {
        toast.error('Mã OTP không chính xác');
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Mã OTP mới đã được gửi đến email của bạn');
      console.log('Demo OTP: 123456');
    }, 1000);
  };

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Xác thực Email</CardTitle>
          <CardDescription>
            Mã OTP đã được gửi đến email<br />
            <span className="font-medium text-foreground">{formData.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Nhập mã OTP (6 chữ số)
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Không nhận được mã?
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm"
              >
                Gửi lại mã OTP
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('register')}
              className="w-full"
              disabled={isLoading}
            >
              Quay lại
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Đăng ký tài khoản</CardTitle>
        <CardDescription className="text-center">
          Tạo tài khoản mới cho ứng dụng chat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tối thiểu 8 ký tự
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Đã có tài khoản?{' '}
            <a href="#" className="text-primary hover:underline">
              Đăng nhập
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
