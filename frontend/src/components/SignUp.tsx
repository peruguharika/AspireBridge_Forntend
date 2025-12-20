import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Phone, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { authAPI, userAPI } from '../utils/api';
import { setAuthToken } from '../config';

interface SignUpProps {
  onLogin: (user: any) => void;
}

// Helper function to convert file to data URL
const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function SignUp({ onLogin }: SignUpProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: OTP Verification
  const [userType, setUserType] = useState<'aspirant' | 'achiever'>('aspirant');

  // Exam subcategories mapping
  const examSubCategories: { [key: string]: string[] } = {
    'SSC': ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC CPO', 'SSC JE', 'SSC Stenographer', 'SSC GD'],
    'UPSC': ['UPSC CSE', 'UPSC CDS', 'UPSC CAPF', 'UPSC NDA', 'UPSC Engineering Services', 'UPSC Forest Service'],
    'Banking': ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk', 'RBI Grade B', 'NABARD', 'SIDBI'],
    'Railways': ['RRB NTPC', 'RRB Group D', 'RRB JE', 'RRB ALP', 'RRB RPF', 'RRB TC'],
    'State PSC': ['State PCS', 'State Police', 'State Forest Service', 'State Engineering Services'],
    'Defense': ['NDA', 'CDS', 'AFCAT', 'Indian Navy', 'Indian Army', 'Indian Air Force'],
    'Insurance': ['LIC AAO', 'LIC ADO', 'NIACL', 'Oriental Insurance', 'New India Assurance'],
    'Teaching': ['CTET', 'UGC NET', 'KVS', 'NVS', 'DSSSB', 'State TET'],
    'Police': ['State Police Constable', 'State Police SI', 'CAPF', 'RPF', 'CISF'],
    'Technical': ['GATE', 'ISRO', 'DRDO', 'BARC', 'ONGC', 'NTPC'],
    'Others': ['Custom Category']
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    examCategory: '',
    examSubCategory: '',
    currentStatus: '',
    examCleared: '',
    rank: '',
    year: '',
    aboutYou: '',
    scorecardFile: null as File | null
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    setError('');

    // Basic field validation
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.examCategory || !formData.examSubCategory) {
      setError('Please select exam category and subcategory');
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Achiever-specific validation
    if (userType === 'achiever') {
      if (!formData.rank || !formData.year || !formData.aboutYou) {
        setError('Please fill in all achiever details');
        return;
      }
      if (!formData.scorecardFile) {
        setError('Please upload your scorecard');
        return;
      }
    }

    // Aspirant-specific validation
    if (userType === 'aspirant' && !formData.currentStatus) {
      setError('Please enter your current status');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.sendOTP(formData.email);
      if (response.success) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify OTP
      const otpResponse = await authAPI.verifyOTP(formData.email, otp);
      if (!otpResponse.success) {
        setError('Invalid OTP');
        setLoading(false);
        return;
      }

      // Prepare user data
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: userType,
        examCategory: formData.examCategory,
        examSubCategory: formData.examSubCategory
      };

      if (userType === 'aspirant') {
        userData.currentStatus = formData.currentStatus;
      } else {
        userData.rank = formData.rank;
        userData.year = formData.year;
        userData.bio = formData.aboutYou;
        userData.examCleared = formData.examSubCategory; // Set exam cleared to subcategory
        userData.isApproved = false; // Needs admin approval
        
        // Handle scorecard file upload
        if (formData.scorecardFile) {
          try {
            const scorecardDataUrl = await convertFileToDataUrl(formData.scorecardFile);
            userData.scorecardUrl = scorecardDataUrl;
          } catch (error) {
            console.error('Error converting file to data URL:', error);
            setError('Failed to process scorecard file');
            setLoading(false);
            return;
          }
        }
      }

      // Sign up
      const response = await authAPI.signup(userData);

      if (response.success) {
        // Store token
        if (response.token) {
          setAuthToken(response.token);
        }

        const user = response.user;

        // 3-place save strategy
        // 1. Session Storage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // 2. Local Storage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userId', user.id || user._id || user.email);
        localStorage.setItem('userType', user.userType || user.user_type);
        
        // 3. In-memory (via callback)
        onLogin(user);

        // Navigate based on user type
        if (userType === 'achiever') {
          alert('Your account is pending admin approval. You will be notified via email once approved.');
          navigate('/');
        } else {
          navigate('/dashboard/aspirant');
        }
      } else {
        setError(response.message || 'Sign up failed');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-8">Join MentorConnect and start your journey</p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Basic Info</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Verify Email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am an...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('aspirant')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      userType === 'aspirant'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Aspirant</div>
                    <div className="text-sm text-gray-600">Looking for guidance</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('achiever')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      userType === 'achiever'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Achiever</div>
                    <div className="text-sm text-gray-600">Want to mentor</div>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Category</label>
                  <select
                    required
                    value={formData.examCategory}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        examCategory: e.target.value,
                        examSubCategory: '' // Reset subcategory when category changes
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="SSC">SSC</option>
                    <option value="UPSC">UPSC</option>
                    <option value="Banking">Banking</option>
                    <option value="Railways">Railways</option>
                    <option value="State PSC">State PSC</option>
                    <option value="Defense">Defense</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Teaching">Teaching</option>
                    <option value="Police">Police</option>
                    <option value="Technical">Technical</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Exam Subcategory - Show only if main category is selected */}
                {formData.examCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.examCategory} Exams
                    </label>
                    <select
                      required
                      value={formData.examSubCategory}
                      onChange={(e) => setFormData({ ...formData, examSubCategory: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {formData.examCategory} exam</option>
                      {examSubCategories[formData.examCategory]?.map((subCat) => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {userType === 'aspirant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                  <input
                    type="text"
                    required
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Final Year Student, Working Professional"
                  />
                </div>
              )}

              {userType === 'achiever' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rank/Score</label>
                      <input
                        type="text"
                        required
                        value={formData.rank}
                        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="AIR 45 / 85.5%"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year Cleared</label>
                      <select
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About You</label>
                    <textarea
                      required
                      value={formData.aboutYou}
                      onChange={(e) => setFormData({ ...formData, aboutYou: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your journey, experience, and how you can help aspirants..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scorecard Upload <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        required
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setError('File size must be less than 5MB');
                              return;
                            }
                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              setError('Please upload an image file');
                              return;
                            }
                            setError(''); // Clear any previous errors
                            setFormData({ ...formData, scorecardFile: file });
                          }
                        }}
                        className="hidden"
                        id="scorecard-upload"
                      />
                      <label htmlFor="scorecard-upload" className="cursor-pointer">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm">
                            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      </label>
                      {formData.scorecardFile && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ {formData.scorecardFile.name}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Upload a clear photo of your exam scorecard/result for verification (JPG, PNG only, max 5MB)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your profile will be reviewed by our admin team before going live. 
                      We'll verify your credentials and notify you once approved.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  {userType === 'aspirant' ? 'Aspirant Guidelines' : 'Achiever Agreement'}
                </a>{' '}
                and acknowledge our data protection practices.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  We've sent a verification code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                className="w-full text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
