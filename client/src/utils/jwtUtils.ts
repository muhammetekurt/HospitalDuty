// JWT token'dan claims'leri okumak için utility fonksiyonlar

export interface JWTClaims {
  userId?: string;
  email?: string;
  fullName?: string;
  departmentId?: string;
  hospitalId?: string;
  roles?: string[];
}

export const parseJWTClaims = (token: string): JWTClaims => {
  try {
    // JWT token'ı decode et
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    
    return {
      userId: payload.nameid || payload.sub,
      email: payload.email,
      fullName: payload.name,
      departmentId: payload.DepartmentId,
      hospitalId: payload.HospitalId,
      roles: payload.role || []
    };
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return {};
  }
};

export const hasRole = (token: string, role: string): boolean => {
  const claims = parseJWTClaims(token);
  return claims.roles?.includes(role) || false;
};

export const hasAnyRole = (token: string, roles: string[]): boolean => {
  const claims = parseJWTClaims(token);
  return roles.some(role => claims.roles?.includes(role)) || false;
};
