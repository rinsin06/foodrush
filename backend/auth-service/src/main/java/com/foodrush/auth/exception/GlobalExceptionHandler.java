package com.foodrush.auth.exception;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j @RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Not found: {}", ex.getMessage()); return buildError(HttpStatus.NOT_FOUND, ex.getMessage()); }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage()); }
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage()); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fe = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField,
                f -> Objects.requireNonNullElse(f.getDefaultMessage(),"Invalid"), (a,b)->a));
        ErrorResponse e = ErrorResponse.builder().timestamp(LocalDateTime.now())
            .status(422).error("Validation Failed").message("Invalid request").fieldErrors(fe).build();
        return ResponseEntity.status(422).body(e);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred"); }
    private ResponseEntity<ErrorResponse> buildError(HttpStatus s, String msg) {
        return ResponseEntity.status(s).body(ErrorResponse.builder()
            .timestamp(LocalDateTime.now()).status(s.value()).error(s.getReasonPhrase()).message(msg).build()); }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ErrorResponse {
        private LocalDateTime timestamp; private int status; private String error, message;
        private Map<String, String> fieldErrors;
    }
}