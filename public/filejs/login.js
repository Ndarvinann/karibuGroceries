
// document.addEventListener("DOMContentLoaded", () =>{//make sure html is fully loaded and parsed by the browser before loading js.

  
//     //visibility settings

//     // Password visibility toggle
//     //select the password icon
//     const togglePassword = document.getElementById("togglePassword");
//     if (togglePassword) {
//       //check if toggle.b exists,then add event listener.
//       togglePassword.addEventListener("click", ()=>{//add click event listener
//           //get the password input field
//           const passwordInput = document.getElementById("password");
//           //get the icon element inside the input feild.
//           const icon = this.querySelector("i");
//           // is password currently hidden
//           if (passwordInput.type === "password") {
//             //change it to visible text
//             passwordInput.type = "text";
//             //replace the eye icon with shut eye icon
//             icon.classList.replace("bi-eye", "bi-eye-slash");
//             //if the password is visible
//           } else {
//             //change the text back to dots.
//             passwordInput.type = "password";
//             //replace the open eye with a shut eye icon
//             icon.classList.replace("bi-eye-slash", "bi-eye");
//           }
//         });
//       }

//     // 2. FORM VALIDATION
//     const loginForm = document.getElementById("loginForm");
//     if (loginForm) {
//       loginForm.addEventListener("submit", function(e) {
//         //clear previous errors
//         document.querySelectorAll('.is-invalid').forEach(el=>{
//           el.classList.remove('is-invalid')
//         });
//         document.querySelectorAll('.error-message').forEach(el=>{
//           el.textContent = "";
//         })

//         //validate Email
//         const email = document.getElementById('email');
//         if(!email.value.trim() || !email.value.includes('@')){
//           e.preventDefault();
//           email.classList.add('is-invalid');
//           const emailError = document.getElementById('emailError');
//           if(emailError) emailError.textContent = 'Invalid email';
//         }

//         //validate Password
//         const password = document.getElementById('password');
//       if (!password.value.trim()|| password.value.length<10){
//         e.preventDefault();
//         password.classList.add('is-invalid');
//         const passwordError = document.getElementById('passwordError');
//         if(passwordError) passwordError.textContent= 'password must be 10+ characters'; 
//       }
//       });
//     }
//   });

document.addEventListener("DOMContentLoaded", () => {
  // Password visibility toggle
  const togglePassword = document.getElementById("togglePassword");
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const passwordInput = document.getElementById("password");
      const icon = togglePassword.querySelector("i");
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        passwordInput.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  }

});
