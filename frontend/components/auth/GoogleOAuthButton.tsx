import { API_BASE_URL } from '@/constants';
import { Button } from '@/components/ui/button';

export function GoogleOAuthButton() {
  return (
    <Button type="button" variant="outline" className="w-full" asChild>
      <a href={`${API_BASE_URL}/auth/google`}>Continue with Google</a>
    </Button>
  );
}
