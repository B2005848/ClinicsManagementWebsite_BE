const ApiError = require("../api-error");
const accountPatientServices = require("../Services/account.patients.service");
const moment = require("moment");

const accountPatientControllers = {
  async createAccount(req, res, next) {
    try {
      const first_name = req.body?.first_name;
      const last_name = req.body?.last_name;
      const username = req.body?.username;
      const password = req.body?.password;
      const email = req.body?.email;

      if (!first_name && !last_name) {
        return next(new ApiError(400, "Name is required"));
      }
      if (!username) {
        return next(new ApiError(400, "Username is required"));
      }
      if (!password) {
        return next(new ApiError(400, "Password is required"));
      }
      let birthday =
        req.body?.birthday !== undefined ? req.body?.birthday : null;
      if (birthday) {
        //input DD/MM/YYYY
        birthday = moment(birthday, "DD/MM/YYYY").format("YYYY-MM-DD");
      }
      const accountData = {
        patient_id: username,
        password: password,
      };

      const patient_detailsData = {
        first_name: first_name,
        last_name: last_name,
        birthday: birthday,
        phone_number: username,
        email: email,
      };
      const resultCreate_account = await accountPatientServices.createAccount(
        accountData,
        patient_detailsData
      );
      if (resultCreate_account.status === true) {
        return res.status(201).json({
          message: resultCreate_account.message,
          data: resultCreate_account.data,
        });
      } else {
        return next(new ApiError(400, "Account already exists"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  async checkLogin(req, res, next) {
    try {
      const username = req.body?.username;
      const password = req.body?.password;

      if (!username) {
        return next(new ApiError(400, "Username is required"));
      }
      if (!password) {
        return next(new ApiError(400, "Password is required"));
      }
      const resultCheckLogin = await accountPatientServices.checkLogin(
        username,
        password
      );
      if (resultCheckLogin.success === true) {
        return res.status(200).json({
          message: "Login successful",
          accessToken: resultCheckLogin.accessToken,
          refreshToken: resultCheckLogin.refreshToken,
          accessTokenExpiry: resultCheckLogin.accessTokenExpiry,
          refreshTokenExpiry: resultCheckLogin.refreshTokenExpiry,
        });
      } else {
        return next(new ApiError(400, "Invalid username or password"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------REFRESH ACCESS TOKEN----------------------------------------------------------
  async refreshAccessToken(req, res, next) {
    try {
      console.log("Request body: ", req.body);
      const { refreshToken } = req.body; // Nhận refresh token từ request body
      const result = await accountPatientServices.refreshAccessToken(
        refreshToken
      );

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return next(new ApiError(403, result.message)); // Trả về lỗi nếu không thành công
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHECK ACCESS TOKEN----------------------------------------------------------
  async checkAccessToken(req, res, next) {
    try {
      const { accessToken } = req.body; // Nhận access token từ request body

      if (!accessToken) {
        return next(new ApiError(400, "Access token is required"));
      }

      const result = await accountPatientServices.checkAccessToken(accessToken); // Gọi dịch vụ để kiểm tra token

      if (result.success) {
        return res.status(200).json({
          message: "Access token is valid",
          staff_id: result.staff_id,
          username: result.username,
          expiresAt: result.expiresAt,
        });
      } else {
        return next(new ApiError(401, result.message)); // Trả về lỗi nếu token không hợp lệ
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHECK REFRESH TOKEN----------------------------------------------------------
  async checkRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body; // Nhận access token từ request body

      if (!refreshToken) {
        return next(new ApiError(400, "Refresh token is required"));
      }

      const result = await accountPatientServices.checkRefreshToken(
        refreshToken
      ); // Gọi dịch vụ để kiểm tra token

      if (result.success) {
        return res.status(200).json({
          message: "Access token is valid",
          staff_id: result.staff_id,
          expiresAt: result.expiresAt,
        });
      } else {
        return next(new ApiError(401, result.message)); // Trả về lỗi nếu token không hợp lệ
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ------------------------------UPDATE STATUS ACCOUNT-----------------------------------------
  async updateStatusAccount(req, res, next) {
    try {
      const patient_id = req.params.id;
      const status = req.body.status;
      const resultUpdateStatus =
        await accountPatientServices.updateStatusAccount(patient_id, status);
      if (resultUpdateStatus.success === true) {
        return res.status(200).json({
          message: "Status updated",
          data: resultUpdateStatus.data,
        });
      } else {
        return next(new ApiError(400, "Failed to update status"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = accountPatientControllers;
