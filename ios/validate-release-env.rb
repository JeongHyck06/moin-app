#!/usr/bin/env ruby
# frozen_string_literal: true

require 'uri'

# react-native-config 의 .env 대체 로딩을 막고 운영 연결에 필요한 값만 검증
module ReleaseEnvironment
  def self.validate(values)
    uri = URI.parse(values.fetch('API_BASE_URL', ''))
    host = uri.host.to_s.downcase
    reserved = host == 'localhost' || host == 'example.com' || host.end_with?('.example', '.invalid', '.test', '.localhost', '.example.com')
    local = host.match?(/\A(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/) || host == '[::1]'
    unless uri.scheme == 'https' && !host.empty? && !reserved && !local && !uri.userinfo && !uri.query && !uri.fragment && ['', '/'].include?(uri.path)
      raise 'API_BASE_URL 에 실제 운영 HTTPS origin을 설정하세요 (경로·인증정보·예시 주소 제외)'
    end
    unless values.fetch('KAKAO_APP_KEY', '').match?(/\A[0-9a-f]{32}\z/i)
      raise 'KAKAO_APP_KEY 에 카카오 네이티브 앱 키를 설정하세요'
    end
    google_keys = %w[GOOGLE_WEB_CLIENT_ID GOOGLE_IOS_CLIENT_ID GOOGLE_REVERSED_CLIENT_ID]
    if google_keys.any? { |key| !values.fetch(key, '').empty? }
      %w[GOOGLE_WEB_CLIENT_ID GOOGLE_IOS_CLIENT_ID].each do |key|
        unless values.fetch(key, '').match?(/\A[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com\z/)
          raise "#{key} 에 Google OAuth 클라이언트 ID를 설정하세요"
        end
      end
      expected_scheme = values.fetch('GOOGLE_IOS_CLIENT_ID').split('.').reverse.join('.')
      unless values.fetch('GOOGLE_REVERSED_CLIENT_ID', '') == expected_scheme
        raise 'GOOGLE_REVERSED_CLIENT_ID 가 iOS 클라이언트 ID의 역순 URL 스킴과 다릅니다'
      end
    end
  rescue URI::InvalidURIError
    raise 'API_BASE_URL 형식이 올바르지 않습니다'
  end

  def self.check
    root = File.expand_path('..', __dir__)
    file = File.join(root, '.env.prod')
    raise '.env.prod 파일이 필요합니다' unless File.file?(file)
    if File.exist?('/tmp/envfile') && File.expand_path(File.read('/tmp/envfile').strip, root) != file
      raise '/tmp/envfile 이 운영 파일을 덮어쓰고 있습니다. 해당 빌드 설정을 먼저 정리하세요'
    end
    ENV['ENVFILE'] = '.env.prod'
    require File.join(root, 'node_modules/react-native-config/ios/ReactNativeConfig/ReadDotEnv')
    values, = read_dot_env(root)
    validate(values)
    puts '운영 환경 검증 통과 (.env.prod, HTTPS, 카카오 키)'
  end
end

if $PROGRAM_NAME == __FILE__ && ENV.fetch('CONFIGURATION', 'Release') == 'Release'
  begin
    ReleaseEnvironment.check
  rescue StandardError => e
    warn "error: #{e.message}"
    exit 1
  end
end
