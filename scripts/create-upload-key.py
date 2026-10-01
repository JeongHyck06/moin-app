#!/usr/bin/env python3
# coding: utf-8
"""로컬 업로드 키 최초 생성, 기존 키와 비밀번호는 덮어쓰지 않음"""
import os, secrets, subprocess
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'android'
folder = root / 'signing'
props = root / 'keystore.properties'
if props.exists() or (folder / 'upload.keystore').exists():
    raise SystemExit('기존 서명 파일이 있어 중단했습니다')
folder.mkdir(mode=0o700, exist_ok=True)
password = secrets.token_urlsafe(36)
env = dict(os.environ, MOIN_KEY_PASSWORD=password)
subprocess.run(['keytool', '-genkeypair', '-keystore', str(folder / 'upload.keystore'), '-alias', 'moin-upload', '-keyalg', 'RSA', '-keysize', '3072', '-validity', '10000', '-storetype', 'PKCS12', '-storepass:env', 'MOIN_KEY_PASSWORD', '-keypass:env', 'MOIN_KEY_PASSWORD', '-dname', 'CN=Moin Upload, O=Moin, C=KR'], env=env, check=True)
os.chmod(folder / 'upload.keystore', 0o600)
fd = os.open(props, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as f:
    f.write(f'storeFile=signing/upload.keystore\nstorePassword={password}\nkeyAlias=moin-upload\nkeyPassword={password}\n')
subprocess.run(['keytool', '-exportcert', '-rfc', '-keystore', str(folder / 'upload.keystore'), '-alias', 'moin-upload', '-storepass:env', 'MOIN_KEY_PASSWORD', '-file', str(folder / 'upload-certificate.pem')], env=env, check=True)
print('업로드 키 생성 완료: android/signing 및 android/keystore.properties를 함께 안전하게 백업하세요')
