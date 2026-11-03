package com.bionexus.backend.service;

import com.bionexus.backend.dal.AdminsDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.AuthResponse;
import com.bionexus.backend.dto.LoginRequest;
import com.bionexus.backend.dto.MeDto;
import com.bionexus.backend.dto.RegisterRequest;
import com.bionexus.backend.enums.AccountType;
import com.bionexus.backend.enums.AdminStatus;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.UserStatus;
import com.bionexus.backend.model.Admins;
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

    public AuthResponse loginAdmin(LoginRequest request) {
        Admins admin = adminsDao.getAdminByAccount(request.getUsername());
        if (admin == null || !PasswordUtil.verifyPassword(request.getPassword(), admin.getPasswordHash())) {
            throw new ApiException(MessageKey.AUTH_INVALID_CREDENTIALS);
        }
        if(admin.getStatus() == AdminStatus.BANNED || admin.getStatus() == null) {
            throw new ApiException(MessageKey.AUTH_ACCOUNT_BANNED);
        }
        if(admin.getStatus() == AdminStatus.INACTIVE || admin.getStatus() == null) {
            throw new ApiException(MessageKey.AUTH_ACCOUNT_INACTIVE);
        }
        String role = admin.getAdminRole().name();
        String token = generateToken(admin.getAdminID(), admin.getAccount(), AccountType.ADMIN.name(), role);
        return new AuthResponse(token, admin.getAdminID(), admin.getAccount(), admin.getFullName(), AccountType.ADMIN.name(), role);
    }

    public AuthResponse registerUser(RegisterRequest request){
        if(request == null ||
        request.username() == null || request.username().isBlank() ||
        request.password() == null || request.password().isBlank() ||
        request.email() == null || request.email().isBlank() ||
        request.fullName() == null || request.fullName().isBlank() ||
        request.phone() == null || request.phone().isBlank()){
            throw new ApiException(MessageKey.USER_MISSING_FIELDS);
        }

        if(userDao.getUserByUsername(request.username()) != null){
            throw new ApiException(MessageKey.USER_USERNAME_EXISTS);
        }

        if(userDao.getUserByEmail(request.email()) != null){
            throw new ApiException(MessageKey.USER_EMAIL_EXISTS);
        }

        String passwordHash = PasswordUtil.hashPassword(request.password());
        Users newUser = new Users(request.username(), passwordHash, request.email(), request.fullName(), request.phone(), request.address());
        userDao.insertUser(newUser);

        Users savedUser = userDao.getUserByUsername(request.username());
        String token = generateToken(savedUser.getUserId(), savedUser.getUsername(), AccountType.USER.name(), AccountType.USER.name());
        return new AuthResponse(token, savedUser.getUserId(), savedUser.getUsername(), savedUser.getFullName(), AccountType.USER.name(), "USER");
    }
    public MeDto getMe(int userId) {
        Users user = userDao.getUserById(userId);
        if (user == null) {
            throw new ApiException(MessageKey.USER_NOT_FOUND);
        }
        SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        return MeDto.fromEntity(user, shop);
    }
}
