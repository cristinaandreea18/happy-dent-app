import { server } from '../../config/global';

class UserStore {
  constructor() {
    this.data = null;
  }

  async register(username, email, password, role) {
    try {
      const response = await fetch(`${server}/auth/register`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
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

  async login(username, password) {
    try {
      const response = await fetch(`${server}/auth/login`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = await response.json();
      console.log('User data after login', this.data);
      localStorage.setItem('token', this.data.token);
      localStorage.setItem('user', JSON.stringify(this.data));
      return this.data;
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async logout(userProfile) {
    try {
      const response = await fetch(`${server}/auth/logout`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.data.token,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      this.data = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (userProfile) {
        userProfile.data = {};
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async updateUserProfilePic(userId, imageFile) {
    const formData = new FormData();
    formData.append('profilePic', imageFile);
    formData.append('id', userId);

    const response = await fetch(`${server}/user/updateuserprofilepic`, {
      method: 'put',
      headers: {
        Authorization: localStorage.getItem('token'),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const updated = await response.json();

    this.data = {
      ...this.data,
      data: {
        ...this.data.data,
        profilePicURL: updated.user.profilePicURL,
      },
    };

    localStorage.setItem('user', JSON.stringify(this.data));

    // return this.data;
    return { user: updated.user };
  }

  async requestPasswordReset(email) {
    try {
      const response = await fetch(`${server}/auth/password/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la trimiterea emailului');
      }

      return await response.json();
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(
        `${server}/auth/password/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la resetarea parolei');
      }

      return await response.json();
    } catch (err) {
      console.warn(err);
      throw err;
    }
  }

  async changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${server}/auth/password/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }
}

export default UserStore;
