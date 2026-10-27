package com.bionexus.backend.service;

import com.bionexus.backend.dal.AdminsDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.AuthResponse;
import com.bionexus.backend.dto.LoginRequest;
import com.bionexus.backend.enums.AccountType;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.UserStatus;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.model.Users;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JwtUtil;
import com.bionexus.backend.util.PasswordUtil;

import static com.bionexus.backend.util.JwtUtil.generateToken;

public class AuthService {
    private final UsersDao userDao = new UsersDao();
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();
    private final AdminsDao adminsDao = new AdminsDao();

    public AuthResponse loginUser(LoginRequest loginRequest){
        Users user = userDao.getUserByUsername(loginRequest.getUsername());
        if(user == null || !PasswordUtil.verifyPassword(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new ApiException(MessageKey.AUTH_INVALID_CREDENTIALS);
        }



        if (user.getUserStatus() == UserStatus.BANNED) {
            throw new ApiException(MessageKey.AUTH_ACCOUNT_BANNED);
        }
        if(user.getUserStatus() == UserStatus.INACTIVE) {
            throw new ApiException(MessageKey.AUTH_ACCOUNT_INACTIVE);
        }

        String token = generateToken(user.getUserId(), user.getUsername(), AccountType.USER.name(), "USER");
        return new AuthResponse(token,user.getUserId(), user.getUsername(), user.getFullName(), AccountType.USER.name(), "USER");
    }
}
