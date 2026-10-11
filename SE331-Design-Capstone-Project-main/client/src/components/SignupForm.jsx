import React, { useState } from 'react'

const SignupForm = () => {

    const [formData, setFormData] = useState(
        {
            uname: "",
            email: "",
            password: "",
            confirmPass: "",
        }
    );

    const [errors, setErrors] = useState({});

    function handleChange(e){
        const {name, value} = e.target;
        setFormData({...formData, [name]:value });
        console.log(formData);
    }

    function validate(data){
        const newErrors = {}

        if(!data.uname.trim()){
            newErrors.uname = "Username is required."
        }

        if(!data.email.trim()){
            newErrors.email = "Invalid email."
        }

        if (data.password.length < 6){
            newErrors.password = "Password must be at least 6 chars."
        }

        if(data.password !== data.confirmPass){
            newErrors.confirmPass = "Passwords do not match."
        }

        return newErrors;
    }

    function handleSubmit(e){
        e.preventDefault();
        const valErrors = validate(formData);
        setErrors(valErrors);
    }

  return (
    <form className='signup-form' onSubmit={handleSubmit}>
        <label htmlFor="uname">Username</label>
        <input type="text" placeholder='Username'
            name='uname'
            value={formData.uname}
            onChange={handleChange}
        />
        {errors.uname && <p style={{color:"red"}}>{errors.uname}</p>}

        <label htmlFor="email">Email</label>
        <input type="email" placeholder='Email' 
            name='email'
            value={formData.email}
            onChange={handleChange}
        />
        {errors.email && <p style={{color:"red"}}>{errors.email}</p>}
        <label htmlFor="pass">Password</label>
        <input type="password" placeholder='Password' 
            name='password'
            value={formData.password}
            onChange={handleChange}
        />
        {errors.password && <p style={{color:"red"}}>{errors.password}</p>}
        <label htmlFor="confirm">Confirm Password</label>
        <input type="password" placeholder='Confirm Password' 
            name='confirmPass'
            value={formData.confirmPass}
            onChange={handleChange}
        />
        {errors.confirmPass && <p style={{color:"red"}}>{errors.confirmPass}</p>}
        <button type='submit'>Register</button>
    </form>
  )
}

export default SignupForm