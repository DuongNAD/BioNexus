// BioNexus ParticleMorph Vertex Shader
// Hỗ trợ nội suy 4 hình thái, lốc xoáy chuyển pha, đẩy chuột, sóng kích và bảng màu thích ứng

uniform float uTime;
uniform float uProgress;       // 0.0 -> 3.0
uniform float uSize;           // Kích thước điểm cơ sở (điều chỉnh theo DPR)
uniform float uPush;           // Lực đẩy chuột (tự suy giảm khi chuột đứng yên)
uniform vec3 uMouse;           // Toạ độ chuột chiếu trên mặt phẳng Z=0
uniform float uShockT;         // Thời điểm kích hoạt sóng xung kích
uniform vec3 uShockP;          // Tâm sóng xung kích
uniform vec3 uCA[4];           // Bảng màu cận A theo 4 chương
uniform vec3 uCB[4];           // Bảng màu cận B theo 4 chương

attribute vec3 aPos0;          // Galaxy
attribute vec3 aPos1;          // DNA
attribute vec3 aPos2;          // Leaf
attribute vec3 aPos3;          // Earth Surface
attribute vec3 aColor;         // Màu định danh tĩnh
attribute float aRand;         // Nhiễu hạt độc lập [0, 1]
attribute float aLand;         // Cờ lục địa (1.0 = đất liền, 0.0 = biển/khác)

varying vec3 vColor;
varying float vAlpha;

// Hàm nội suy bậc 3 có phân tán thời gian theo aRand
float getStage(float k) {
  float t = clamp((uProgress - k) * 1.6 - aRand * 0.6, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  // 1. Tính toán tiến độ giữa các hình thái liên tiếp
  float t0 = getStage(0.0);    // Galaxy -> DNA
  float t1 = getStage(1.0);    // DNA -> Leaf
  float t2 = getStage(2.0);    // Leaf -> Earth

  // 2. Nội suy vị trí không gian
  vec3 pos = mix(aPos0, aPos1, t0);
  pos = mix(pos, aPos2, t1);
  pos = mix(pos, aPos3, t2);

  // 3. Hiệu ứng xoáy chuyển pha (Chỉ xuất hiện giữa chừng)
  float mid = sin(3.14159265 * t0) + sin(3.14159265 * t1) + sin(3.14159265 * t2);
  vec3 swirl = vec3(
    sin(pos.y * 1.7 + uTime * 0.9 + aRand * 6.0),
    cos(pos.z * 1.5 + uTime * 0.7 + aRand * 3.0),
    sin(pos.x * 1.3 + uTime * 0.8 + aRand * 5.0)
  );
  pos += swirl * mid * 0.6;

  // 4. Dao động thở vi mô hữu cơ
  pos += 0.035 * vec3(
    sin(uTime * 1.3 + aRand * 40.0),
    cos(uTime * 1.1 + aRand * 30.0),
    sin(uTime * 0.9 + aRand * 20.0)
  );

  // 5. Chuyển sang toạ độ World để tương tác vật lý
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);

  // 5.1. Lực đẩy con trỏ (Repulsion)
  vec3 dMouse = worldPos.xyz - uMouse;
  float distMouse = length(dMouse.xy);
  float fMouse = smoothstep(1.5, 0.0, distMouse) * uPush;
  worldPos.xyz += normalize(dMouse + vec3(0.0001)) * fMouse * 0.8;

  // 5.2. Sóng xung kích khi bấm chuột (Shockwave Ring)
  float age = uTime - uShockT;
  if (age >= 0.0 && age < 3.0) {
    vec3 dShock = worldPos.xyz - uShockP;
    float distShock = length(dShock.xy);
    float ring = smoothstep(0.7, 0.0, abs(distShock - age * 5.0)) * exp(-age * 1.2);
    worldPos.xyz += normalize(dShock + vec3(0.0001)) * ring * 0.9;
  }

  // 6. Chiếu toạ độ View và Projection
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;

  // 7. Độ lớn điểm hạt (Point Size Attenuation)
  float twinkle = 0.75 + 0.25 * sin(uTime * 2.2 + aRand * 60.0);
  float landScale = mix(1.0, 1.4, aLand * step(2.5, uProgress)); // Hạt lục địa to hơn ở pha địa cầu
  gl_PointSize = uSize * (0.5 + aRand) * twinkle * landScale / (-mvPosition.z);

  // 8. Pha trộn màu theo chương & hiệu ứng phát sáng
  vec3 col = mix(uCA[0], uCB[0], aRand);
  col = mix(col, mix(uCA[1], uCB[1], aRand), t0);
  col = mix(col, mix(uCA[2], uCB[2], aRand), t1);
  
  // Ở pha địa cầu (chương cuối), hạt lục địa dùng màu xanh non/ngọc, hạt biển dùng màu ocean mờ
  vec3 earthColor = mix(vec3(0.22, 0.74, 0.97), mix(uCA[3], uCB[3], aRand), aLand);
  col = mix(col, earthColor, t2);

  // Thêm độ sáng tại nơi tương tác chuột hoặc sóng kích
  vColor = col + fMouse * 0.5;

  // 9. Độ mờ theo chiều sâu (Depth fade)
  float depthFade = clamp(1.5 - (-mvPosition.z - 6.0) * 0.15, 0.3, 1.0);
  vAlpha = (0.45 + aRand * 0.55) * depthFade;
  if (t2 > 0.5 && aLand < 0.5) {
    vAlpha *= 0.35; // Biển mờ 35% theo đặc tả BioEarth
  }
}
