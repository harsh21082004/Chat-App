import React, { useState, useEffect } from 'react';
import styles from '../styles/Register.module.css';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import OtpInput from 'react-otp-input';
import PhoneInput from 'react-phone-input-2';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch } from 'react-redux';
import { addAuthUser, login, sendOtpHandler, verifyOtpHandler } from '../redux/thunks/userThunks';
import BlueButton from './Buttons/BlueButton';

const Login = () => {
  const dispatch = useDispatch();
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState('phone');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
  });


  useEffect(() => {
    let countdown;
    if (step === 'otp' && timer > 0) {
      countdown = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(countdown);
  }, [step, timer]);

  // Check token expiration and remove if expired
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const decodedToken = jwtDecode(user);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('user');
        setIsVerified(false);
      } else {
        setIsVerified(decodedToken.isVerified);
      }
    }
  }, []);

  // const googleLogin = useGoogleLogin({
  //   onSuccess: tokenResponse => console.log(tokenResponse),
  // });

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: `+${value}` }));
  };

  const handleOtpChange = (otp) => {
    setFormData((prevData) => ({
      ...prevData,
      otp: otp,
    }));
  };

  const configureCaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA verified:', response);
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          },
        } // ✅ Make sure this is properly imported
      );
      window.recaptchaVerifier.render();
    }
  };


  const sendOtp = async (e) => {
    e?.preventDefault();

    try {
      const result = await dispatch(sendOtpHandler({ phone: formData.phone, configureCaptcha }));

      if (sendOtpHandler.fulfilled.match(result)) {
        const authUserAction = await dispatch(addAuthUser({ phone: formData.phone }));
        if (addAuthUser.fulfilled.match(authUserAction)) {
          setStep('otp');
          setVerifying(true);
          setTimer(30);
          setCanResend(false);
        }
      } else {
        console.log("❌ Redux Error:", result.payload);
      }
    } catch (err) {
      console.log("❌ Local Error:", err);
    }
  };

  useEffect(() => {
    if (verifying) {
      setStep('otp')
    }
  }, [verifying])


  const verifyOtp = async (e) => {
    const resultVerifyAction = await dispatch(verifyOtpHandler({ otp: formData.otp }));

    if (verifyOtpHandler.fulfilled.match(resultVerifyAction)) {
      try {
        const resultAction = await dispatch(login({ phone: resultVerifyAction?.payload }));

        if (login.fulfilled.match(resultAction)) {
          localStorage.setItem('token', resultAction.payload.token);
          const decoded = jwtDecode(resultAction.payload.user);
          if (decoded.isVerified) {
            setVerifying(false);
            localStorage.setItem('user', resultAction.payload.user);
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
      }
    }

    setIsVerified(true);
    setVerifying(false);
  }

  return (
    <div className={`${styles.registerForm} container mt-5`}>
      <div id="recaptcha-container"></div>
      <div className={`${styles.image}`}>
        <img src="/formImage.jpg" alt="formImage" />
      </div>
      <div className={`${styles.form}`}>
        <form onSubmit={sendOtp}>
          <h2>Login to your account</h2>
          <p>
            Don't have an account? <Link to={'/register'}>Register</Link>
          </p>

          {!isVerified && (
            <>
              {step === 'phone' && (
                <>
                  <h4>Enter Phone Number</h4>
                  <div className={`${styles.input}`}>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputStyle={{ width: '100%' }}
                      className={`${styles.phoneInput}`}
                    />
                  </div>
                  <BlueButton type={'submit'} text={'Send OTP'} submit={sendOtp} />
                </>
              )}
            </>
          )}

          {step === 'otp' && (
            <>
              <h4>Enter OTP</h4>
              <form onSubmit={verifyOtp} className={`${styles.input} ${styles.otpInput}`}>
                <OtpInput
                  value={formData.otp}
                  onChange={handleOtpChange}
                  numInputs={6}
                  isInputNum
                  shouldAutoFocus
                  inputStyle={{
                    width: '3rem',
                    height: '3rem',
                    fontSize: '1.5rem',
                    borderRadius: 4,
                    border: '1px solid #ccc',
                    justifyContent: 'space-between'
                  }}
                  renderInput={(props) => <input {...props} />}
                />
                <li className={`${styles.resendOtp} my-2`}>
                  {canResend ? (
                    <span onClick={sendOtp}>Resend OTP</span>
                  ) : (
                    <span style={{ color: 'gray', cursor: 'not-allowed' }}>
                      Resend in {timer}s
                    </span>
                  )}
                </li>
              </form>
              <BlueButton type={'submit'} text={'Verify OTP'} submit={verifyOtp} />
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;