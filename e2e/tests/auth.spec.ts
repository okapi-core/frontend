import type {
  CreateUserRequest,
  SignInRequest,
} from '../../src/lib/request-types';
import { expect, test } from '../fixtures/api';
import {
  signinHttpErrorHandler,
  signupHttpErrorHandler,
} from '../mocks/auth-handlers';

test.describe('signup and signin', () => {
  test('redirects the root route and links between auth pages', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('prevents invalid signup details from reaching the API', async ({
    page,
  }) => {
    const signupRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/v1/users') {
        signupRequests.push(request.url());
      }
    });

    await page.goto('/signup');
    await page.getByLabel('Email').fill('invalid-email');
    await page.locator('#password').fill('short');
    await page.locator('#confirm-password').fill('different');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Please enter a valid email')).toBeVisible();
    await expect(
      page.getByText('Password should be at least 8 chars long.'),
    ).toBeVisible();
    await expect(page.getByText('Passwords must match')).toBeVisible();
    expect(signupRequests).toHaveLength(0);
  });

  test('signs up with a REST-contract request and returns to signin', async ({
    page,
    useApiHandlers,
  }) => {
    useApiHandlers();
    await page.goto('/signup');

    const signupRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        new URL(request.url()).pathname === '/api/v1/users',
    );

    await page.getByLabel('Email').fill('new-user@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    const signupRequest = await signupRequestPromise;
    const requestBody: CreateUserRequest = signupRequest.postDataJSON();
    expect(requestBody).toEqual({
      email: 'new-user@example.com',
      password: 'password123',
    });

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText('Sign up successful, redirecting.'),
    ).toBeVisible();
  });

  test('shows a signup API error and remains on the form', async ({
    page,
    useApiHandlers,
  }) => {
    const errorMessage = 'An account with this email already exists.';
    useApiHandlers(signupHttpErrorHandler(errorMessage));
    await page.goto('/signup');

    await page.getByLabel('Email').fill('existing@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(errorMessage)).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(
      page.getByRole('button', { name: 'Create Account' }),
    ).toBeEnabled();
  });

  test('shows the generic signup error after a network failure', async ({
    page,
    useApiHandlers,
  }) => {
    useApiHandlers();
    await page.route('**/api/v1/users', (route) =>
      route.abort('connectionfailed'),
    );
    await page.goto('/signup');

    await page.getByLabel('Email').fill('new-user@example.com');
    await page.locator('#password').fill('password123');
    await page.locator('#confirm-password').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(
      page.getByText('Could not sign up, please try again.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/signup$/);
  });

  test('prevents invalid signin details from reaching the API', async ({
    page,
  }) => {
    const signinRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/v1/users/sign-in') {
        signinRequests.push(request.url());
      }
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('short');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Please enter a valid email')).toBeVisible();
    await expect(
      page.getByText('Password should be at least 8 chars long.'),
    ).toBeVisible();
    expect(signinRequests).toHaveLength(0);
  });

  test('shows a signin API error and remains on the form', async ({
    page,
    useApiHandlers,
  }) => {
    const errorMessage = 'Invalid email or password.';
    useApiHandlers(signinHttpErrorHandler(errorMessage));
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(errorMessage)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  test('signs in and completes the authenticated bootstrap', async ({
    page,
    useApiHandlers,
  }) => {
    useApiHandlers();
    await page.goto('/login');

    const signinRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        new URL(request.url()).pathname === '/api/v1/users/sign-in',
    );

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    const signinRequest = await signinRequestPromise;
    const requestBody: SignInRequest = signinRequest.postDataJSON();
    expect(requestBody).toEqual({
      email: 'user@example.com',
      password: 'password123',
    });

    await expect(page).toHaveURL(/\/main\/oscar$/);
  });
});
