package com.bionexus.backend.service;

import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.MeDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.model.Users;
import com.bionexus.backend.util.ApiException;

public class UserService {
    private final UsersDao usersDao = new UsersDao();
    private final SellerService sellerService = new SellerService();

    public MeDto getMe (int userId) throws Exception {
        Users user = usersDao.getUserById(userId);
        if (user == null) {
            throw new ApiException(MessageKey.USER_NOT_FOUND);
        }
        return MeDto.fromUser(user, sellerService.getShopById(userId));
    }
}
