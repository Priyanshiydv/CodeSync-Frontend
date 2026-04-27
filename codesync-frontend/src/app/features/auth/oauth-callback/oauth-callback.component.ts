import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; align-items:center; justify-content:center;
      min-height:100vh; background:#0f0f12; color:white; font-size:16px;">
      <div style="text-align:center;">
        <div style="font-size:32px; margin-bottom:16px;">⏳</div>
        <p>Completing sign in...</p>
      </div>
    </div>
  `
})
export class OauthCallbackComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Read token and provider from URL query params
    // e.g. /auth/oauth-callback?token=xxx&provider=google
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const provider = params['provider'];

      if (token) {
        // Store token exactly like normal login does
        this.auth.storeToken(token);

        // Redirect based on role decoded from token
        this.auth.redirectByRole();
      } else {
        // No token — something went wrong
        this.router.navigate(['/auth/login'], {
          queryParams: {
            error: `${provider} login failed. Please try again.`
          }
        });
      }
    });
  }
}