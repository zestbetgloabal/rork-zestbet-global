# Zest Bet Global - Django Server

This is the backend server for the Zest Bet Global application, built with Django and Django REST Framework.

## Setup Instructions

### Local Development

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run migrations:
   ```
   python manage.py migrate
   ```

4. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```
   python manage.py runserver
   ```

### AWS Elastic Beanstalk Deployment

1. Install the EB CLI:
   ```
   pip install awsebcli
   ```

2. Initialize EB CLI:
   ```
   eb init -p python-3.9 zestbet-global
   ```

3. Create an environment:
   ```
   eb create zestbet-global-env
   ```

4. Deploy the application:
   ```
   eb deploy
   ```

5. Set environment variables:
   ```
   eb setenv DJANGO_SECRET_KEY=your-secret-key DJANGO_DEBUG=False
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get token

### Users
- `GET /api/users/` - List users
- `GET /api/users/me/` - Get current user
- `POST /api/users/add_test_zest/` - Add test Zest to user balance

### Bets
- `GET /api/bets/` - List bets
- `POST /api/bets/` - Create a new bet
- `GET /api/bets/{id}/` - Get bet details
- `POST /api/bets/{id}/like/` - Like/unlike a bet
- `POST /api/bets/{id}/place_bet/` - Place a bet

### Social
- `GET /api/social-posts/` - List social posts
- `POST /api/social-posts/` - Create a new post
- `POST /api/social-posts/{id}/like/` - Like/unlike a post
- `GET /api/social-posts/{id}/comments/` - Get post comments
- `POST /api/social-posts/{id}/add_comment/` - Add a comment

### Missions
- `GET /api/missions/` - List all missions
- `GET /api/user-missions/` - List user's missions

### Impact Projects
- `GET /api/impact-projects/` - List impact projects
- `GET /api/impact-projects/featured/` - Get featured project

### Other Endpoints
- `GET /api/transactions/` - List user's transactions
- `GET /api/notifications/` - List user's notifications
- `GET /api/leaderboard/` - Get leaderboard
- `POST /api/invite/use-code/` - Use an invite code

## Models

- **User** - Custom user model with Zest balance, points, etc.
- **Bet** - Betting events with title, description, pool, etc.
- **BetPlacement** - Records of users placing bets
- **SocialPost** - User social posts
- **Comment** - Comments on social posts
- **Mission** - Missions users can complete
- **UserMission** - User progress on missions
- **ImpactProject** - Charity projects
- **Transaction** - Record of all Zest transactions
- **Notification** - User notifications
- **Friendship** - User friendships
- **Category** - Categories for bets