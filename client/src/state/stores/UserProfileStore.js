import { server } from '../../config/global';

class UserProfileStore {
  constructor() {
    this.data = null;
  }

  async getUserProfile(userId) {
    try {
      const response = await fetch(`${server}/user/users/${userId}/profile`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
      });
      if (response.status === 404) {
        return '';
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async createUserProfile(
    userId,
    firstName = '',
    lastName = '',
    dateOfBirth = '',
    identificationNumber = '',
    gender = '',
    ocupation = '',
    phoneNumber = '',
    county = '',
    city = '',
    email
  ) {
    try {
      const response = await fetch(`${server}/user/users/${userId}/profile`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth,
          identificationNumber,
          gender,
          ocupation,
          phoneNumber,
          county,
          city,
          email,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async updateUserProfile(
    userId,
    firstName,
    lastName,
    dateOfBirth,
    identificationNumber,
    gender,
    ocupation,
    phoneNumber,
    county,
    city,
    email
  ) {
    try {
      const response = await fetch(`${server}/user/users/${userId}/profile`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify({
          firstName,
          lastName,
          dateOfBirth,
          identificationNumber,
          gender,
          ocupation,
          phoneNumber,
          county,
          city,
          email,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      return this.data;
    } catch (err) {
      console.warn(err);

      throw err;
    }
  }
}

export default UserProfileStore;
