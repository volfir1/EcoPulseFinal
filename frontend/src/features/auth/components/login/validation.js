// utils/validation.js
import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required')
});

export const initialValues = {
  email: '',
  password: ''
};