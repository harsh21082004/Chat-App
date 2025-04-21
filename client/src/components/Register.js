import React, { useState, useEffect } from 'react';
import styles from '../styles/Register.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { auth } from '../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import OtpInput from 'react-otp-input';
import { useDispatch } from 'react-redux';
import { addAuthUser, register, verifyUser } from '../redux/thunks/userThunks';

const Register = () => {
  const dispatch = useDispatch();
  const [isVerified, setIsVerified] = useState(false);      // ✅ Controls if form is visible
  const [verifying, setVerifying] = useState(false);                   // ✅ Stores OTP
  const [step, setStep] = useState('phone');                // ✅ Steps between 'phone', 'otp', 'form'
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [formData, setFormData] = useState({                // ✅ For form inputs
    firstName: '',
    lastName: '',
    email: '',
    file: null,
    otp: '',
    phone: ''
  });
  const [preview, setPreview] = useState(null);

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

  useEffect(() => {
    // Check if the user exists in localStorage when the component mounts
    const user = localStorage.getItem('user');
    if (user) {
      const decodedToken = jwtDecode(user);

      // Check if the token has expired
      const currentTime = Date.now() / 1000; // Convert to seconds
      console.log(decodedToken.exp, currentTime);
      if (decodedToken.exp < currentTime) {
        // Token has expired, remove it from localStorage
        localStorage.removeItem('user');
        setIsVerified(false); // Ensure isVerified is set to false
      } else {
        // Token is still valid, update formData and isVerified state
        if (decodedToken.isVerified) {
          setFormData({
            ...formData,
            phone: decodedToken.phone
          });
          setIsVerified(true);
        }
      }
    }
  }, []);

  // This will run only when the component mounts

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const selectedFile = files[0];

      // Generate preview URL
      setPreview(URL.createObjectURL(selectedFile));

      setFormData((prev) => ({
        ...prev,
        file: selectedFile, // Store the actual file
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: `+${value}` }));
  };

  const handleOtpChange = (otp) => {
    setFormData((prevData) => ({
      ...prevData,
      otp: otp,
    }));
  };

  console.log(formData)

  const handleRegister = async (e) => {
    e.preventDefault();

    if (isVerified) {
      // User is verified, proceed with registration
      try {
        const resultAction = await dispatch(register({ formData }));
        console.log(resultAction);

        if (register.fulfilled.match(resultAction)) {
          localStorage.setItem('token', resultAction.payload.token);
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          console.log("❌ Error:", resultAction.payload);
        }
      } catch (error) {
        console.error('Error registering user:', error);
      }
    }
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

  const sendOtp = async () => {
    // configureCaptcha();

    // const appVerifier = window.recaptchaVerifier;
    // console.log(appVerifier)

    // try {
    // const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
    // if (confirmationResult) {
    //   window.confirmationResult = confirmationResult;
    console.log("OTP sent");
    const resultAction = await dispatch(addAuthUser({ phone: formData.phone }));
    console.log(resultAction);

    if (addAuthUser.fulfilled.match(resultAction)) {
      setStep('otp');
      setVerifying(true)
      setTimer(30);
      setCanResend(false);
    } else {
      console.log("❌ Error:", resultAction.payload);
    }

    // const response = await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/add-auth-user`, {
    //   phone: formData.phone,
    // })
    // if (response.status === 200) {
    //   setStep('otp');
    //   setVerifying(true)
    //   setTimer(30);           // Reset timer
    //   setCanResend(false);    // Disable resend initially
    // }
    // }
    // } catch (error) {
    //   console.error("OTP error:", error);
    // }
  };


  console.log(isVerified, verifying)

  useEffect(() => {
    if (verifying) {
      setStep('otp')
    }
  }, [verifying])

  const verifyOtp = async () => {
    // const confirmationResult = window.confirmationResult;
    // if (confirmationResult) {
    //   try {
    //     const result = await confirmationResult.confirm(formData.otp);
    //     const phoneNumber = result.user.phoneNumber;
    const phone = formData.phone;

    const resultAction = await dispatch(verifyUser({ phone }))
    console.log(resultAction)

    if (verifyUser.fulfilled.match(resultAction)) {
      setIsVerified(true);
      setVerifying(false);
      setStep('form');
    } else {
      console.log("❌ Error:", resultAction.payload);
    }

    // Call backend to save phone and mark user as verified
    // await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/verify-user`, {
    //   phone: phoneNumber,
    // });
    //   } catch (error) {
    //     console.error('OTP verification failed:', error);
    //   }
    // }
  };

  return (
    <div className={`${styles.registerForm} container mt-5`}>
      <div id="recaptcha-container"></div>
      <div className={`${styles.image}`}>
        <img src="/formImage.jpg" alt="formImage" />
      </div>
      <div className={`${styles.form}`}>
        <form onSubmit={handleRegister}>
          <h2>Create an account for free</h2>
          <p>
            Already have an account? <Link to={'/login'}>Login</Link>
          </p>
          {step === 'form' && (
            <>

              {isVerified && (
                <>
                  <div className={`${styles.fileInput}`}>
                    <input type="file" id="file" name="file" onChange={handleChange} />
                    <label htmlFor="file">
                      {preview ? (
                        <img src={preview} alt="Profile Preview" style={{ width: "100px", height: "100px", borderRadius: "50%" }} />
                      ) : (
                        <img src="/add-image.png" alt="add" />
                      )}
                    </label>
                    <p>Profile Picture</p>
                  </div>
                  <div className={`${styles.inputName}`}>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                    />
                  </div>
                  <div className={`${styles.input}`}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                  </div>
                  <div className={`${styles.input}`}>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Mobile Number"
                      required
                    />
                  </div>
                  <div className={`${styles.checkBox}`}>
                    <label className={`${styles.customCheckbox}`}>
                      <input type="checkbox" id="terms" />
                      <span className={`${styles.checkMark}`}></span>
                      Accept terms and conditions
                    </label>
                  </div>
                  <div className={`${styles.btn}`}>
                    <button type="submit">Create account</button>
                  </div>
                </>
              )}
            </>
          )}

          {!isVerified && !verifying && (
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
                  <div className={`${styles.btn} my-2`}>
                    <span onClick={sendOtp}>Send OTP</span>
                  </div>
                </>
              )}
            </>
          )}

          {step === 'otp' && verifying && !isVerified && (
            <>
              <h4>Enter OTP</h4>
              <div className={`${styles.input} ${styles.otpInput}`}>
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
              </div>
              <div className={`${styles.btn} my-2`}>
                <span onClick={verifyOtp}>Verify OTP</span>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
