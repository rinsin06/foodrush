package com.foodrush.auth.service;

import com.foodrush.auth.dto.AddressDTO;
import com.foodrush.auth.dto.AddressRequest;
import com.foodrush.auth.exception.ResourceNotFoundException;
import com.foodrush.auth.model.UserAddress;
import com.foodrush.auth.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository addressRepository;

    public List<AddressDTO> getUserAddresses(Long userId) {
        return addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AddressDTO> getUserAddressesByCity(Long userId, String city) {
        return addressRepository
                .findByUserIdAndCity(userId, city)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public AddressDTO addAddress(Long userId, AddressRequest request) {
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }
        UserAddress address = UserAddress.builder()
                .userId(userId)
                .label(request.getLabel())
                .addressLine(request.getAddressLine())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(request.getIsDefault())
                .build();
        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(Long userId, Long addressId, AddressRequest request) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }
        address.setLabel(request.getLabel());
        address.setAddressLine(request.getAddressLine());
        address.setLandmark(request.getLandmark());
        address.setCity(request.getCity());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setIsDefault(request.getIsDefault());
        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDTO setDefault(Long userId, Long addressId) {
        addressRepository.clearDefaultForUser(userId);
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        address.setIsDefault(true);
        return toDTO(addressRepository.save(address));
    }

    private AddressDTO toDTO(UserAddress a) {
        return AddressDTO.builder()
                .id(a.getId())
                .label(a.getLabel())
                .addressLine(a.getAddressLine())
                .landmark(a.getLandmark())
                .city(a.getCity())
                .latitude(a.getLatitude())
                .longitude(a.getLongitude())
                .isDefault(a.getIsDefault())
                .createdAt(a.getCreatedAt())
                .build();
    }
}