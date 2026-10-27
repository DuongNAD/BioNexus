package com.bionexus.backend.service;

import com.bionexus.backend.dal.AdminsDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.AuthResponse;
import com.bionexus.backend.dto.LoginRequest;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.model.Users;

public class AuthService {
    private final UsersDao userDao = new UsersDao();
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();
    private final AdminsDao adminsDao = new AdminsDao();

    public AuthResponse loginUser(LoginRequest loginRequest){
        Users username = userDao.getUserByUsername(loginRequest.getUsername());
        if(username == null) {
            throw new IllegalArgumentException("Sai tài khoản hoặc mật khẩu");
        }
    }
}
