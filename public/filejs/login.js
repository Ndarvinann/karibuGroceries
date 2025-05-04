
document.addEventListener("DOMContentLoaded", () =>{//make sure html is fully loaded and parsed by the browser before loading js.

  
    //visibility settings

    // Password visibility toggle
    //select the password icon
    const togglePassword = document.getElementById("togglePassword");
    if (togglePassword) {
      //check if toggle.b exists,then add event listener.
      togglePassword.addEventListener("click", ()=>{//add click event listener
          //get the password input field
          const passwordInput = document.getElementById("password");
          //get the icon element inside the input feild.
          const icon = this.querySelector("i");
          // is password currently hidden
          if (passwordInput.type === "password") {
            //change it to visible text
            passwordInput.type = "text";
            //replace the eye icon with shut eye icon
            icon.classList.replace("bi-eye", "bi-eye-slash");
            //if the password is visible
          } else {
            //change the text back to dots.
            passwordInput.type = "password";
            //replace the open eye with a shut eye icon
            icon.classList.replace("bi-eye-slash", "bi-eye");
          }
        });
      }


    // Card hover animation
    const card = document.querySelector(".login-card"); //select the entire login card
    if (card) {
      // add a mouseenter event for when the mouse touches the card.
      card.addEventListener("mouseenter", () => {
        //move it down by 5pixels. transform is from the css.
        card.style.transform = "translateY(-5px)";
      });
      //listen for when the mouse leave the card.
      card.addEventListener("mouseleave", () => {
        //push the card back to its original position.
        card.style.transform = "translateY(0)";
      });
    }

    // 2. FORM VALIDATION
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function(e) {
        //clear previous errors
        document.querySelectorAll('.is-invalid').forEach(el=>{
          el.classList.remove('is-invalid')
        });
        document.querySelectorAll('.error-message').forEach(el=>{
          el.textContent = "";
        })

        //validate Email
        const email = document.getElementById('email');
        if(!email.value.trim() || !email.value.includes('@')){
          e.preventDefault();
          email.classList.add('is-invalid');
          const emailError = document.getElementById('emailError');
          if(emailError) emailError.textContent = 'Invalid email';
        }

        //validate Password
        const password = document.getElementById('password');
      if (!password.value.trim()|| password.value.length<10){
        e.preventDefault();
        password.classList.add('is-invalid');
        const passwordError = document.getElementById('passwordError');
        if(passwordError) passwordError.textContent= 'password must be 10+ characters'; 
      }
      });
    }
  });
