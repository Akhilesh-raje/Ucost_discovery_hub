import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../utils/constants.dart';

class ApiService {
  late Dio _dio;
  late IO.Socket _socket;
  WebSocketChannel? _webSocketChannel;
  
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal() {
    _initializeDio();
    _initializeSocket();
  }

  void _initializeDio() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: NetworkConfig.connectionTimeout,
      receiveTimeout: NetworkConfig.readTimeout,
      sendTimeout: NetworkConfig.writeTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Add interceptors for logging and error handling
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        print('🌐 API Request: ${options.method} ${options.path}');
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('✅ API Response: ${response.statusCode}');
        return handler.next(response);
      },
      onError: (error, handler) {
        print('❌ API Error: ${error.message}');
        return handler.next(error);
      },
    ));
  }

  void _initializeSocket() {
    _socket = IO.io(ApiEndpoints.baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionAttempts': 5,
    });

    _socket.onConnect((_) {
      print('🔌 Socket connected');
    });

    _socket.onDisconnect((_) {
      print('🔌 Socket disconnected');
    });

    _socket.onError((error) {
      print('❌ Socket error: $error');
    });
  }

  // HTTP Methods
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> post(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.post(path, data: data, queryParameters: queryParameters);
      return response;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> put(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.put(path, data: data, queryParameters: queryParameters);
      return response;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response> delete(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.delete(path, queryParameters: queryParameters);
      return response;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // File Upload
  Future<Response> uploadFile(String path, File file, {Map<String, dynamic>? extraData}) async {
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
        ...?extraData,
      });
      
      final response = await _dio.post(path, data: formData);
      return response;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  // WebSocket Methods
  WebSocketChannel connectWebSocket(String path) {
    final uri = Uri.parse('${ApiEndpoints.wsUrl}$path');
    _webSocketChannel = WebSocketChannel.connect(uri);
    return _webSocketChannel!;
  }

  void disconnectWebSocket() {
    _webSocketChannel?.sink.close();
    _webSocketChannel = null;
  }

  // Socket.IO Methods
  void connectSocket() {
    _socket.connect();
  }

  void disconnectSocket() {
    _socket.disconnect();
  }

  void emit(String event, dynamic data) {
    _socket.emit(event, data);
  }

  void on(String event, Function(dynamic) handler) {
    _socket.on(event, handler);
  }

  void off(String event) {
    _socket.off(event);
  }

  // Error Handling
  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return Exception('Connection timeout. Please check your internet connection.');
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['message'] ?? 'Server error occurred';
        return Exception('HTTP $statusCode: $message');
      case DioExceptionType.cancel:
        return Exception('Request was cancelled');
      case DioExceptionType.connectionError:
        return Exception('No internet connection');
      default:
        return Exception('An unexpected error occurred');
    }
  }

  // Authentication Methods
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
  }

  // Specific API Methods for UCOST
  Future<Map<String, dynamic>> registerDevice(String deviceId, String deviceName) async {
    final response = await post(ApiEndpoints.mobileRegister, data: {
      'device_id': deviceId,
      'device_name': deviceName,
      'platform': Platform.isAndroid ? 'android' : 'ios',
    });
    return response.data;
  }

  Future<Map<String, dynamic>> uploadExhibit(Map<String, dynamic> exhibitData) async {
    final response = await post(ApiEndpoints.mobileUpload, data: exhibitData);
    return response.data;
  }

  Future<Map<String, dynamic>> getSyncStatus() async {
    final response = await get(ApiEndpoints.mobileSync);
    return response.data;
  }

  Future<Map<String, dynamic>> connectP2P(String targetDeviceId) async {
    final response = await post(ApiEndpoints.mobileConnect, data: {
      'target_device_id': targetDeviceId,
    });
    return response.data;
  }

  // Admin Panel Integration
  Future<Map<String, dynamic>> getAdminData() async {
    final response = await get('/api/admin/dashboard');
    return response.data;
  }

  Future<Map<String, dynamic>> updateExhibit(String exhibitId, Map<String, dynamic> data) async {
    final response = await put('${ApiEndpoints.exhibits}/$exhibitId', data: data);
    return response.data;
  }

  Future<void> deleteExhibit(String exhibitId) async {
    await delete('${ApiEndpoints.exhibits}/$exhibitId');
  }

  // Real-time Updates
  void subscribeToUpdates(String deviceId) {
    _socket.emit('subscribe', {'device_id': deviceId});
  }

  void unsubscribeFromUpdates() {
    _socket.emit('unsubscribe');
  }

  // Cleanup
  void dispose() {
    disconnectSocket();
    disconnectWebSocket();
  }
} 