const validateUser = (username, email, password, confirmPassword) => {
  var lowerCaseLetters = /[a-z]/g;
  var upperCaseLetters = /[A-Z]/g;
  var numbers = /[0-9]/g;
  var specials = /[!@#$^&*]/g;

  if (username.length < 5) {
    return 'Username trebuie să aibă cel puțin 5 caractere!';
  }

  if (!email.includes('@') || !email.includes('.')) {
    return 'Email invalid!';
  }

  if (
    password.length < 8 ||
    !password.match(lowerCaseLetters) ||
    !password.match(upperCaseLetters) ||
    !password.match(numbers) ||
    !password.match(specials)
  ) {
    return 'Parola trebuie să aibă cel puțin 8 caractere, o literă mare, un număr și un caracter special!';
  }

  if (password !== confirmPassword) {
    return 'Parolele nu se potrivesc!';
  }
  return '';
};

const validatePassword = (password, confirmPassword) => {
  var lowerCaseLetters = /[a-z]/g;
  var upperCaseLetters = /[A-Z]/g;
  var numbers = /[0-9]/g;
  var specials = /[!@#$^&*]/g;
  if (
    password.length < 8 ||
    !password.match(lowerCaseLetters) ||
    !password.match(upperCaseLetters) ||
    !password.match(numbers) ||
    !password.match(specials)
  ) {
    return 'Parola trebuie să aibă cel puțin 8 caractere, o literă mare, un număr și un caracter special!';
  }
  if (password !== confirmPassword) {
    return 'Parolele nu se potrivesc!';
  }
  return '';
};

const validateUserProfile = (
  gender,
  identificationNumber,
  phoneNumber,
  dateOfBirth
) => {
  if (identificationNumber.length !== 13) {
    return 'Numărul de identificare trebuie să aibă exact 13 cifre!';
  }
  const firstDigit = identificationNumber[0];
  const birthDateCNP = identificationNumber.substring(1, 7); //yymmdd

  if (gender === 'male' && firstDigit !== '1' && firstDigit !== '5') {
    return 'Pentru bărbați, CNP-ul trebuie să înceapă cu 1 sau 5!';
  }

  if (gender === 'female' && firstDigit !== '2' && firstDigit !== '6') {
    return 'Pentru femei, CNP-ul trebuie să înceapă cu 2 sau 6!';
  }

  if (dateOfBirth) {
    const parts = dateOfBirth.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      const yy = yyyy.substring(2, 4);

      const expectedBirthDate = `${yy}${mm}${dd}`;
      if (expectedBirthDate !== birthDateCNP) {
        return 'Data nașterii din CNP nu se potrivește cu data de naștere furnizată!';
      }
    } else {
      return 'Data nașterii trebuie să fie în formatul yyyy-mm-dd!';
    }
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'Numărul de telefon trebuie să aibă exact 10 cifre!';
  }

  return '';
};

const validateDoctorForm = (
  firstName,
  lastName,
  email,
  phoneNumber,
  specialization
) => {
  if (firstName.length < 3) {
    return 'Prenumele trebuie să aibă cel puțin 3 caractere!';
  }

  if (lastName.length < 3) {
    return 'Prenumele trebuie să aibă cel puțin 3 caractere!';
  }

  if (!email.includes('@') || !email.includes('.')) {
    return 'Email invalid!';
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'Numărul de telefon trebuie să aibă exact 10 cifre!';
  }

  if (!specialization) {
    return 'Specializarea este obligatorie!';
  }

  return '';
};

export default {
  validateUser,
  validateUserProfile,
  validateDoctorForm,
  validatePassword,
};
