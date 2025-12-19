module.exports = {
  // Common Schemas
  Error: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Error message'
      },
      error: {
        type: 'string',
        example: 'Detailed error message (only in development)'
      }
    }
  },
  Success: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Success message'
      }
    }
  },

  // User Schemas
  User: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      email: {
        type: 'string',
        nullable: true,
        example: 'john.doe@example.com'
      },
      country_code: {
        type: 'string',
        example: '+1'
      },
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      password: {
        type: 'string',
        description: 'Hashed password (never returned in responses)'
      },
      profile: {
        type: 'string',
        nullable: true,
        example: 'https://example.com/profile.jpg'
      },
      location: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            nullable: true,
            example: '123 Main St'
          },
          city: {
            type: 'string',
            nullable: true,
            example: 'New York'
          },
          type: {
            type: 'string',
            enum: ['Point'],
            example: 'Point',
            description: 'GeoJSON type (required for 2dsphere index)'
          },
          coordinates: {
            type: 'array',
            items: {
              type: 'number'
            },
            minItems: 2,
            maxItems: 2,
            example: [-74.006, 40.7128],
            description: 'GeoJSON coordinates [longitude, latitude]'
          }
        },
        required: ['type', 'coordinates']
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        nullable: true,
        example: 'male'
      },
      date_of_birth: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: '1990-01-01'
      },
      lord_accepted: {
        type: 'string',
        example: 'No "I still have Questions"',
        description: 'Spiritual commitment status (string, not boolean)'
      },
      otp: {
        type: 'number',
        nullable: true,
        description: 'OTP code (never returned in responses)'
      },
      otp_expiry: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'OTP expiration time (never returned in responses)'
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      social_token: {
        type: 'string',
        nullable: true,
        description: 'Social media authentication token (never returned in responses)'
      },
      social_type: {
        type: 'string',
        enum: ['google', 'facebook', 'apple'],
        nullable: true,
        example: 'google'
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        example: 'user'
      },
      church_id: {
        type: 'string',
        nullable: true,
        example: '507f1f77bcf86cd799439011',
        description: 'Reference to Church model'
      },
      app_language: {
        type: 'string',
        example: 'en',
        default: 'en'
      },
      is_community_created: {
        type: 'number',
        example: 0,
        default: 0
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Soft delete timestamp (never returned for active users)'
      },
      refresh_token: {
        type: 'string',
        nullable: true,
        description: 'JWT refresh token (never returned in responses)'
      },
      reset_password_token: {
        type: 'string',
        nullable: true,
        description: 'Password reset token (never returned in responses)'
      },
      reset_password_expiry: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Password reset token expiration (never returned in responses)'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },

  // Auth Schemas
  SignupRequest: {
    type: 'object',
    required: ['name', 'mobile', 'country_code', 'password', 'confirmPassword'],
    properties: {
      name: {
        type: 'string',
        example: 'John Doe'
      },
      email: {
        type: 'string',
        nullable: true,
        example: 'john.doe@example.com'
      },
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'password123'
      },
      confirmPassword: {
        type: 'string',
        example: 'password123'
      },
      address: {
        type: 'string',
        nullable: true,
        example: '123 Main St'
      },
      city: {
        type: 'string',
        nullable: true,
        example: 'New York'
      },
      lat: {
        type: 'number',
        nullable: true,
        example: 40.7128
      },
      lng: {
        type: 'number',
        nullable: true,
        example: -74.006
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android',
        description: 'Device type (case-insensitive: Android/iOS or android/ios)'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      app_language: {
        type: 'string',
        default: 'en',
        example: 'en',
        description: 'App language preference (e.g., en, es, urd)'
      }
    }
  },
  SigninRequest: {
    type: 'object',
    required: ['mobile', 'country_code', 'password'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      },
      password: {
        type: 'string',
        example: 'password123'
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android',
        description: 'Device type (case-insensitive: Android/iOS or android/ios)'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      }
    }
  },
  VerifyOTPRequest: {
    type: 'object',
    required: ['mobile', 'country_code', 'otp'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      },
      otp: {
        type: 'number',
        example: 1234
      }
    }
  },
  ResendOTPRequest: {
    type: 'object',
    required: ['mobile', 'country_code'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      }
    }
  },
  SocialLoginRequest: {
    type: 'object',
    required: ['social_token', 'social_type'],
    properties: {
      social_token: {
        type: 'string',
        example: 'social-token-123',
        description: 'Social media authentication token from provider'
      },
      social_type: {
        type: 'string',
        enum: ['google', 'apple'],
        example: 'google',
        description: 'Social login provider (only google and apple are supported)'
      },
      name: {
        type: 'string',
        nullable: true,
        example: 'John Doe',
        description: 'User name (required for new users)'
      },
      email: {
        type: 'string',
        nullable: true,
        example: 'john.doe@example.com',
        description: 'User email (required for new users)'
      },
      mobile: {
        type: 'string',
        nullable: true,
        example: '1234567890',
        description: 'User mobile number (optional)'
      },
      country_code: {
        type: 'string',
        nullable: true,
        example: '+1',
        description: 'Country code (defaults to +1 if not provided)'
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android',
        description: 'Device type (case-insensitive: Android/iOS or android/ios)'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      app_language: {
        type: 'string',
        default: 'en',
        example: 'en',
        description: 'App language preference (e.g., en, es, urd)'
      }
    }
  },
  ForgotPasswordRequest: {
    type: 'object',
    required: ['mobile', 'country_code'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      }
    }
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['mobile', 'country_code', 'otp', 'newPassword', 'confirmPassword'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      country_code: {
        type: 'string',
        example: '+1'
      },
      otp: {
        type: 'number',
        example: 1234
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        example: 'newpassword123'
      },
      confirmPassword: {
        type: 'string',
        example: 'newpassword123'
      }
    }
  },
  SetLanguageRequest: {
    type: 'object',
    required: ['app_language'],
    properties: {
      app_language: {
        type: 'string',
        example: 'en'
      }
    }
  },
  UpdateProfileRequest: {
    type: 'object',
    description: 'All fields are optional. Sensitive fields (password, role, email, mobile, country_code) cannot be updated via this endpoint.',
    properties: {
      name: {
        type: 'string',
        example: 'John Doe'
      },
      profile: {
        type: 'string',
        nullable: true,
        example: 'https://example.com/profile.jpg',
        description: 'Profile image URL'
      },
      location: {
        type: 'object',
        description: 'Location object. Can provide address, city, lat/lng, or coordinates. Must be valid GeoJSON format.',
        properties: {
          address: {
            type: 'string',
            nullable: true,
            example: '123 Main St'
          },
          city: {
            type: 'string',
            nullable: true,
            example: 'New York'
          },
          lat: {
            type: 'number',
            nullable: true,
            example: 40.7128,
            description: 'Latitude (will be converted to coordinates array with lng)'
          },
          lng: {
            type: 'number',
            nullable: true,
            example: -74.006,
            description: 'Longitude (will be converted to coordinates array with lat)'
          },
          coordinates: {
            type: 'array',
            items: {
              type: 'number'
            },
            minItems: 2,
            maxItems: 2,
            example: [-74.006, 40.7128],
            description: 'GeoJSON coordinates [longitude, latitude]'
          }
        }
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        nullable: true,
        example: 'male'
      },
      date_of_birth: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: '1990-01-01'
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      app_language: {
        type: 'string',
        example: 'en',
        description: 'App language preference (e.g., en, es, urd)'
      }
    }
  },
  AuthResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Authentication successful'
      },
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User'
          },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }
  },

  // Church Schemas
  Church: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      user_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
      },
      name: {
        type: 'string',
        example: 'First Baptist Church'
      },
      location: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            example: '123 Church St'
          },
          city: {
            type: 'string',
            example: 'New York'
          },
          type: {
            type: 'string',
            example: 'Point'
          },
          coordinates: {
            type: 'array',
            items: {
              type: 'number'
            },
            example: [-74.006, 40.7128]
          }
        }
      },
      place_id: {
        type: 'string',
        nullable: true,
        example: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
      },
      is_availability: {
        type: 'number',
        example: 1
      },
      church_status: {
        type: 'number',
        example: 1
      },
      approve_status: {
        type: 'number',
        example: 0,
        description: '0: pending, 1: rejected, 2: approved'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  CreateChurchRequest: {
    type: 'object',
    required: ['name', 'location'],
    properties: {
      name: {
        type: 'string',
        example: 'First Baptist Church'
      },
      location: {
        type: 'object',
        required: ['address', 'city', 'coordinates'],
        properties: {
          address: {
            type: 'string',
            example: '123 Church St'
          },
          city: {
            type: 'string',
            example: 'New York'
          },
          coordinates: {
            type: 'array',
            items: {
              type: 'number'
            },
            minItems: 2,
            maxItems: 2,
            example: [-74.006, 40.7128],
            description: '[longitude, latitude]'
          }
        }
      },
      place_id: {
        type: 'string',
        nullable: true,
        example: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
      }
    }
  },
  UpdateChurchStatusRequest: {
    type: 'object',
    required: ['approve_status'],
    properties: {
      approve_status: {
        type: 'number',
        enum: [0, 1, 2],
        example: 2,
        description: '0: pending, 1: rejected, 2: approved'
      }
    }
  },
  ChurchResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Church created successfully'
      },
      data: {
        type: 'object',
        properties: {
          church: {
            $ref: '#/components/schemas/Church'
          }
        }
      }
    }
  },
  ChurchesListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Churches retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          churches: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Church'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 50
              },
              pages: {
                type: 'number',
                example: 5
              }
            }
          }
        }
      }
    }
  },

  // Event Schemas
  Event: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      event_name: {
        type: 'string',
        example: 'Sunday Service'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Weekly Sunday worship service'
      },
      event_type: {
        type: 'string',
        nullable: true,
        example: 'worship'
      },
      start_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: '2024-01-07'
      },
      start_time: {
        type: 'string',
        nullable: true,
        example: '10:00 AM'
      },
      end_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: '2024-01-07'
      },
      end_time: {
        type: 'string',
        nullable: true,
        example: '12:00 PM'
      },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'pending'
      },
      virtual_link_or_location: {
        type: 'string',
        nullable: true,
        example: 'https://zoom.us/j/123456789'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  CreateEventRequest: {
    type: 'object',
    required: ['event_name'],
    properties: {
      event_name: {
        type: 'string',
        example: 'Sunday Service'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Weekly Sunday worship service'
      },
      event_type: {
        type: 'string',
        nullable: true,
        example: 'worship'
      },
      start_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2024-01-07T00:00:00.000Z',
        description: 'Event start date (Date type in model, accepts ISO 8601 date-time string)'
      },
      start_time: {
        type: 'string',
        nullable: true,
        example: '10:00 AM',
        description: 'Event start time (string format)'
      },
      end_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2024-01-07T00:00:00.000Z',
        description: 'Event end date (Date type in model, accepts ISO 8601 date-time string)'
      },
      end_time: {
        type: 'string',
        nullable: true,
        example: '12:00 PM',
        description: 'Event end time (string format)'
      },
      virtual_link_or_location: {
        type: 'string',
        nullable: true,
        example: 'https://zoom.us/j/123456789'
      }
    }
  },
  UpdateEventRequest: {
    type: 'object',
    properties: {
      event_name: {
        type: 'string',
        example: 'Sunday Service'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Weekly Sunday worship service'
      },
      event_type: {
        type: 'string',
        nullable: true,
        example: 'worship'
      },
      start_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2024-01-07T00:00:00.000Z',
        description: 'Event start date (Date type in model, accepts ISO 8601 date-time string)'
      },
      start_time: {
        type: 'string',
        nullable: true,
        example: '10:00 AM',
        description: 'Event start time (string format)'
      },
      end_date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        example: '2024-01-07T00:00:00.000Z',
        description: 'Event end date (Date type in model, accepts ISO 8601 date-time string)'
      },
      end_time: {
        type: 'string',
        nullable: true,
        example: '12:00 PM',
        description: 'Event end time (string format)'
      },
      virtual_link_or_location: {
        type: 'string',
        nullable: true,
        example: 'https://zoom.us/j/123456789'
      }
    }
  },
  UpdateEventStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'approved'
      }
    }
  },
  EventResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Event created successfully'
      },
      data: {
        type: 'object',
        properties: {
          event: {
            $ref: '#/components/schemas/Event'
          }
        }
      }
    }
  },
  EventsListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Events retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Event'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 50
              },
              pages: {
                type: 'number',
                example: 5
              }
            }
          }
        }
      }
    }
  },

  // Note Schemas
  Note: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      user_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
      },
      bible_id: {
        type: 'string',
        example: 'ENGESV'
      },
      bible_name: {
        type: 'string',
        nullable: true,
        example: 'English Standard Version'
      },
      book_version: {
        type: 'string',
        nullable: true,
        example: 'ESV'
      },
      filesetsid: {
        type: 'string',
        nullable: true,
        example: 'ENGESV'
      },
      bookname: {
        type: 'string',
        nullable: true,
        example: 'John'
      },
      bookid: {
        type: 'string',
        nullable: true,
        example: 'JHN'
      },
      chapter_number: {
        type: 'number',
        example: 3
      },
      start_verse: {
        type: 'number',
        nullable: true,
        example: 16
      },
      end_verse: {
        type: 'number',
        nullable: true,
        example: 17
      },
      highlighted_text: {
        type: 'string',
        example: 'For God so loved the world...'
      },
      api_path: {
        type: 'string',
        nullable: true,
        example: '/bible/ENGESV/JHN/3'
      },
      message: {
        type: 'string',
        nullable: true,
        example: 'This is a powerful verse about God\'s love'
      },
      thought: {
        type: 'string',
        nullable: true,
        example: 'God\'s love is unconditional'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  CreateNoteRequest: {
    type: 'object',
    required: ['bible_id', 'chapter_number', 'highlighted_text'],
    properties: {
      bible_id: {
        type: 'string',
        example: 'ENGESV'
      },
      bible_name: {
        type: 'string',
        nullable: true,
        example: 'English Standard Version'
      },
      book_version: {
        type: 'string',
        nullable: true,
        example: 'ESV'
      },
      filesetsid: {
        type: 'string',
        nullable: true,
        example: 'ENGESV'
      },
      bookname: {
        type: 'string',
        nullable: true,
        example: 'John'
      },
      bookid: {
        type: 'string',
        nullable: true,
        example: 'JHN'
      },
      chapter_number: {
        type: 'number',
        example: 3
      },
      start_verse: {
        type: 'number',
        nullable: true,
        example: 16
      },
      end_verse: {
        type: 'number',
        nullable: true,
        example: 17
      },
      highlighted_text: {
        type: 'string',
        example: 'For God so loved the world...'
      },
      api_path: {
        type: 'string',
        nullable: true,
        example: '/bible/ENGESV/JHN/3'
      },
      message: {
        type: 'string',
        nullable: true,
        example: 'This is a powerful verse about God\'s love'
      },
      thought: {
        type: 'string',
        nullable: true,
        example: 'God\'s love is unconditional'
      }
    }
  },
  UpdateNoteRequest: {
    type: 'object',
    properties: {
      bible_id: {
        type: 'string',
        example: 'ENGESV'
      },
      bible_name: {
        type: 'string',
        nullable: true,
        example: 'English Standard Version'
      },
      book_version: {
        type: 'string',
        nullable: true,
        example: 'ESV'
      },
      filesetsid: {
        type: 'string',
        nullable: true,
        example: 'ENGESV'
      },
      bookname: {
        type: 'string',
        nullable: true,
        example: 'John'
      },
      bookid: {
        type: 'string',
        nullable: true,
        example: 'JHN'
      },
      chapter_number: {
        type: 'number',
        example: 3
      },
      start_verse: {
        type: 'number',
        nullable: true,
        example: 16
      },
      end_verse: {
        type: 'number',
        nullable: true,
        example: 17
      },
      highlighted_text: {
        type: 'string',
        example: 'For God so loved the world...'
      },
      api_path: {
        type: 'string',
        nullable: true,
        example: '/bible/ENGESV/JHN/3'
      },
      message: {
        type: 'string',
        nullable: true,
        example: 'This is a powerful verse about God\'s love'
      },
      thought: {
        type: 'string',
        nullable: true,
        example: 'God\'s love is unconditional'
      }
    }
  },
  NoteResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Note created successfully'
      },
      data: {
        type: 'object',
        properties: {
          note: {
            $ref: '#/components/schemas/Note'
          }
        }
      }
    }
  },
  NotesListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Notes retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          notes: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Note'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 50
              },
              pages: {
                type: 'number',
                example: 5
              }
            }
          }
        }
      }
    }
  },

  // Prayer Request Schemas
  PrayerRequest: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      church_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-07T00:00:00.000Z',
        description: 'Prayer request date (Date type in model)'
      },
      time: {
        type: 'string',
        example: '10:00 AM',
        description: 'Prayer request time (string format)'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      dial_code: {
        type: 'string',
        nullable: true,
        example: '+1'
      },
      mobile_number: {
        type: 'string',
        example: '1234567890'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Please pray for healing'
      },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'pending'
      },
      user_id: {
        type: 'string',
        nullable: true,
        example: '507f1f77bcf86cd799439013'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  CreatePrayerRequestRequest: {
    type: 'object',
    required: ['church_id', 'date', 'time', 'name', 'mobile_number'],
    properties: {
      church_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-07T00:00:00.000Z',
        description: 'Prayer request date (will be converted to Date type)'
      },
      time: {
        type: 'string',
        example: '10:00 AM'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      dial_code: {
        type: 'string',
        nullable: true,
        example: '+1'
      },
      mobile_number: {
        type: 'string',
        example: '1234567890'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Please pray for healing'
      }
    }
  },
  UpdatePrayerRequestRequest: {
    type: 'object',
    properties: {
      church_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
      },
      date: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-07T00:00:00.000Z',
        description: 'Prayer request date (will be converted to Date type)'
      },
      time: {
        type: 'string',
        example: '10:00 AM'
      },
      name: {
        type: 'string',
        example: 'John Doe'
      },
      dial_code: {
        type: 'string',
        nullable: true,
        example: '+1'
      },
      mobile_number: {
        type: 'string',
        example: '1234567890'
      },
      description: {
        type: 'string',
        nullable: true,
        example: 'Please pray for healing'
      }
    }
  },
  UpdatePrayerRequestStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'approved'
      }
    }
  },
  PrayerRequestResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Prayer request created successfully'
      },
      data: {
        type: 'object',
        properties: {
          prayerRequest: {
            $ref: '#/components/schemas/PrayerRequest'
          }
        }
      }
    }
  },
  PrayerRequestsListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Prayer requests retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          prayerRequests: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/PrayerRequest'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 50
              },
              pages: {
                type: 'number',
                example: 5
              }
            }
          }
        }
      }
    }
  },

  // Admin Authentication Schemas
  AdminSigninRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'admin@example.com'
      },
      password: {
        type: 'string',
        minLength: 6,
        example: 'password123'
      }
    }
  },
  AdminAuthResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Admin login successful'
      },
      data: {
        type: 'object',
        properties: {
          admin: {
            $ref: '#/components/schemas/Admin'
          },
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT access token (expires in 15 minutes)'
          },
          refresh_token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'JWT refresh token (expires in 7 days)'
          }
        }
      }
    }
  },
  Admin: {
    type: 'object',
    properties: {
      _id: {
        type: 'string',
        example: '507f1f77bcf86cd799439011'
      },
      name: {
        type: 'string',
        example: 'Admin User'
      },
      email: {
        type: 'string',
        example: 'admin@example.com'
      },
      role: {
        type: 'string',
        enum: ['admin'],
        example: 'admin'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  RefreshTokenRequest: {
    type: 'object',
    required: ['refresh_token'],
    properties: {
      refresh_token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Valid refresh token'
      }
    }
  },
  RefreshTokenResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Token refreshed successfully'
      },
      data: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            description: 'New JWT access token (expires in 15 minutes)'
          }
        }
      }
    }
  },
  AdminMeResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Admin info retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          admin: {
            $ref: '#/components/schemas/Admin'
          }
        }
      }
    }
  },
  AdminForgotPasswordRequest: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'admin@example.com'
      }
    }
  },
  AdminForgotPasswordResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'If the account exists, a password reset link has been sent'
      },
      data: {
        type: 'object',
        properties: {
          resetToken: {
            type: 'string',
            example: 'a1b2c3d4e5f6...',
            description: 'Only returned in development mode'
          }
        }
      }
    }
  },
  AdminResetPasswordRequest: {
    type: 'object',
    required: ['token', 'newPassword', 'confirmPassword'],
    properties: {
      token: {
        type: 'string',
        example: 'a1b2c3d4e5f6...',
        description: 'Reset token received from forgot-password endpoint'
      },
      newPassword: {
        type: 'string',
        minLength: 6,
        example: 'newpassword123'
      },
      confirmPassword: {
        type: 'string',
        example: 'newpassword123'
      }
    }
  },

  // Dashboard Schemas
  DashboardStatsResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Dashboard statistics retrieved successfully'
      },
      data: {
        type: 'object',
        properties: {
          totalUsers: { type: 'number', example: 100 },
          totalPastors: { type: 'number', example: 25 },
          totalBibles: { type: 'number', example: 500 },
          totalEvents: { type: 'number', example: 50 }
        }
      }
    }
  },
  RegistrationChartResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Registration chart data retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          year: { type: 'number', example: 2024 },
          monthlyData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                month: { type: 'string', example: 'January' },
                monthNumber: { type: 'number', example: 1 },
                users: { type: 'number', example: 10 },
                pastors: { type: 'number', example: 2 }
              }
            }
          }
        }
      }
    }
  },
  SurveyResultsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Survey results retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          yes: { type: 'number', example: 50 },
          no: { type: 'number', example: 20 },
          notSure: { type: 'number', example: 10 },
          total: { type: 'number', example: 80 }
        }
      }
    }
  },
  RecentUsersResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Recent users retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  TotalUsersResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Total users count retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          totalUsers: { type: 'number', example: 100 }
        }
      }
    }
  },

  // Users Management Schemas
  UsersListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Users retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  UserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'User retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' }
        }
      }
    }
  },
  UpdateUserRequest: {
    type: 'object',
    description: 'Admin endpoint to update user. Sensitive fields (password, role, email, mobile, country_code) cannot be updated.',
    properties: {
      name: {
        type: 'string',
        example: 'John Doe'
      },
      profile: {
        type: 'string',
        nullable: true,
        example: 'https://example.com/profile.jpg'
      },
      location: {
        type: 'object',
        description: 'Location object. Must be valid GeoJSON format with type and coordinates.',
        properties: {
          address: {
            type: 'string',
            nullable: true,
            example: '123 Main St'
          },
          city: {
            type: 'string',
            nullable: true,
            example: 'New York'
          },
          lat: {
            type: 'number',
            nullable: true,
            example: 40.7128
          },
          lng: {
            type: 'number',
            nullable: true,
            example: -74.006
          },
          coordinates: {
            type: 'array',
            items: {
              type: 'number'
            },
            minItems: 2,
            maxItems: 2,
            example: [-74.006, 40.7128]
          }
        }
      },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other'],
        nullable: true,
        example: 'male'
      },
      date_of_birth: {
        type: 'string',
        format: 'date',
        nullable: true,
        example: '1990-01-01'
      },
      device_type: {
        type: 'string',
        enum: ['Android', 'iOS', 'android', 'ios'],
        nullable: true,
        example: 'android'
      },
      device_token: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcm_token: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      app_language: {
        type: 'string',
        example: 'en'
      },
      church_id: {
        type: 'string',
        nullable: true,
        example: '507f1f77bcf86cd799439011'
      }
    }
  },

  // Pastor Requests Schemas
  PastorRequestsListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Pastor requests retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          pastorRequests: {
            type: 'array',
            items: { $ref: '#/components/schemas/PastorRequest' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  PastorRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Pastor request retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          pastorRequest: { $ref: '#/components/schemas/PastorRequest' }
        }
      }
    }
  },
  PastorRequest: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Pastor John' },
      email: { type: 'string', example: 'pastor@example.com' },
      mobile: { type: 'string', example: '1234567890' },
      churchName: { type: 'string', example: 'Grace Church' },
      location: { type: 'string', example: 'New York' },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  UpdateStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'approved'
      }
    }
  },

  // Follow-Up Requests Schemas
  FollowUpStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Follow-up statistics retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          total: { type: 'number', example: 50 },
          pending: { type: 'number', example: 20 },
          inProgress: { type: 'number', example: 15 },
          completed: { type: 'number', example: 15 }
        }
      }
    }
  },
  FollowUpRequestsListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Follow-up requests retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          followUpRequests: {
            type: 'array',
            items: { $ref: '#/components/schemas/FollowUpRequest' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  FollowUpRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Follow-up request retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          followUpRequest: { $ref: '#/components/schemas/FollowUpRequest' }
        }
      }
    }
  },
  FollowUpRequest: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', nullable: true, example: 'john@example.com' },
      phone: { type: 'string', nullable: true, example: '1234567890' },
      contact: { type: 'string', nullable: true, example: 'john@example.com, +1-123-456-7890', description: 'Combined contact info' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor',
        default: 'Other'
      },
      assigned_to: { type: 'string', nullable: true, example: 'Pastor John Smith', description: 'Name of pastor/admin assigned' },
      assigned_to_id: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439012', description: 'User ID of assigned person' },
      due_date: { type: 'string', format: 'date-time', nullable: true, example: '2024-01-20T00:00:00.000Z' },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        example: 'pending',
        default: 'pending'
      },
      description: { type: 'string', nullable: true, example: 'Follow up needed' },
      notes: { type: 'string', nullable: true, example: 'Additional notes about the follow-up' },
      user_id: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439013', description: 'Related user ID if applicable' },
      created_by: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439014', description: 'User ID who created this request' },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' }
    }
  },
  CreateFollowUpRequest: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', nullable: true, example: 'john@example.com' },
      phone: { type: 'string', nullable: true, example: '1234567890' },
      contact: { type: 'string', nullable: true, example: 'john@example.com, +1-123-456-7890' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor',
        default: 'Other'
      },
      assigned_to: { type: 'string', nullable: true, example: 'Pastor John Smith' },
      assigned_to_id: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439012' },
      due_date: { type: 'string', format: 'date-time', nullable: true, example: '2024-01-20T00:00:00.000Z' },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        example: 'pending',
        default: 'pending'
      },
      description: { type: 'string', nullable: true, example: 'Follow up needed' },
      notes: { type: 'string', nullable: true, example: 'Additional notes' },
      user_id: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439013' }
    }
  },
  UpdateFollowUpRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', nullable: true, example: 'john@example.com' },
      phone: { type: 'string', nullable: true, example: '1234567890' },
      contact: { type: 'string', nullable: true, example: 'john@example.com, +1-123-456-7890' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor'
      },
      assigned_to: { type: 'string', nullable: true, example: 'Pastor John Smith' },
      assigned_to_id: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439012' },
      due_date: { type: 'string', format: 'date-time', nullable: true, example: '2024-01-20T00:00:00.000Z' },
      description: { type: 'string', nullable: true, example: 'Follow up needed' },
      notes: { type: 'string', nullable: true, example: 'Additional notes' }
    }
  },
  UpdateFollowUpStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        example: 'in_progress'
      }
    }
  },

  // Church Management Schemas
  ChurchStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Church statistics retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          totalChurches: { type: 'number', example: 25 },
          totalMembers: { type: 'number', example: 500 },
          activeChurches: { type: 'number', example: 20 }
        }
      }
    }
  },
  ChurchesListAdminResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Churches retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          churches: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChurchWithMembers' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  ChurchAdminResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Church retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          church: { $ref: '#/components/schemas/ChurchWithMembers' }
        }
      }
    }
  },
  ChurchWithMembers: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'Grace Community Church' },
      pastorName: { type: 'string', example: 'Pastor John' },
      location: { type: 'string', example: 'New York' },
      memberCount: { type: 'number', example: 50 },
      churchStatus: { type: 'number', example: 1 },
      isAvailability: { type: 'number', example: 1 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  UpdateChurchRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Grace Community Church' },
      pastorName: { type: 'string', example: 'Pastor John' },
      location: { type: 'string', example: 'New York' },
      churchStatus: { type: 'number', enum: [0, 1], example: 1 },
      isAvailability: { type: 'number', enum: [0, 1], example: 1 }
    }
  },

  // Prayer Requests Management Schemas
  PrayerRequestStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Prayer request statistics retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          totalRequests: { type: 'number', example: 100 },
          pending: { type: 'number', example: 30 },
          approved: { type: 'number', example: 50 },
          rejected: { type: 'number', example: 20 }
        }
      }
    }
  },
  PrayerRequestsListAdminResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Prayer requests retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          prayerRequests: {
            type: 'array',
            items: { $ref: '#/components/schemas/PrayerRequestAdmin' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  PrayerRequestAdminResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Prayer request retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          prayerRequest: { $ref: '#/components/schemas/PrayerRequestAdmin' }
        }
      }
    }
  },
  PrayerRequestAdmin: {
    type: 'object',
    properties: {
      sno: { type: 'number', example: 1 },
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      user: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          mobile: { type: 'string', example: '1234567890' }
        }
      },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
      phone: { type: 'string', example: '+1 1234567890' },
      mobileNumber: { type: 'string', example: '1234567890' },
      dialCode: { type: 'string', example: '+1' },
      church: { type: 'string', example: 'Grace Community Church' },
      churchId: { type: 'string', example: '507f1f77bcf86cd799439013' },
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'pending'
      },
      requestDate: { type: 'string', format: 'date-time' },
      time: { type: 'string', example: '10:00 AM' },
      description: { type: 'string', example: 'Please pray for healing' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  UpdatePrayerRequestStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        example: 'approved'
      }
    }
  },

  // Common Schemas
  Pagination: {
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      total: { type: 'number', example: 50 },
      pages: { type: 'number', example: 5 }
    }
  },
  Success: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Operation successful' }
    }
  },
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Error message' },
      error: { type: 'string', example: 'Detailed error (development only)' }
    }
  },

  // Chat Schemas
  ChatMessage: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
      user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      admin_id: { type: 'string', example: '507f1f77bcf86cd799439013' },
      message: { type: 'string', example: 'Hello! How can I help you?' },
      sender_id: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', example: 'admin@example.com' },
          profile: { type: 'string', nullable: true, example: 'https://example.com/profile.jpg' }
        }
      },
      sender_role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
      attachment: { type: 'string', nullable: true, example: null },
      attachment_type: { type: 'string', enum: ['image', 'video', 'audio', 'document', null], nullable: true, example: null },
      is_read: { type: 'boolean', example: false },
      read_at: { type: 'string', format: 'date-time', nullable: true, example: null },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
    }
  },
  ConversationItem: {
    type: 'object',
    properties: {
      userId: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'For admin: user ID, For user: not present' },
      userName: { type: 'string', example: 'John Doe', description: 'For admin: user name, For user: not present' },
      userEmail: { type: 'string', example: 'john@example.com', description: 'For admin: user email, For user: not present' },
      userProfile: { type: 'string', nullable: true, example: 'https://example.com/profile.jpg', description: 'For admin: user profile, For user: not present' },
      adminId: { type: 'string', example: '507f1f77bcf86cd799439013', description: 'For user: admin ID, For admin: not present' },
      adminName: { type: 'string', example: 'Admin User', description: 'For user: admin name, For admin: not present' },
      adminEmail: { type: 'string', example: 'admin@example.com', description: 'For user: admin email, For admin: not present' },
      adminProfile: { type: 'string', nullable: true, example: 'https://example.com/admin.jpg', description: 'For user: admin profile, For admin: not present' },
      lastMessage: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          message: { type: 'string', example: 'Thank you for the prayer support!' },
          sender_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          sender_role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:40:00.000Z' }
        }
      },
      unreadCount: { type: 'number', example: 2 }
    }
  },
  ConversationsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Conversations retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          conversations: {
            type: 'array',
            items: { $ref: '#/components/schemas/ConversationItem' }
          }
        }
      }
    }
  },
  MessagesResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Messages retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChatMessage' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  ChatStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Chat statistics retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          totalChats: { type: 'number', example: 5, description: 'Total number of unique chat conversations' },
          onlineUsers: { type: 'number', example: 3, description: 'Number of currently online users' },
          unreadMessages: { type: 'number', example: 3, description: 'Total unread messages for admin' },
          respondedChats: { type: 'number', example: 3, description: 'Number of chats where admin has responded' }
        }
      }
    }
  },
  MarkReadResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Messages marked as read' },
      data: {
        type: 'object',
        properties: {
          updatedCount: { type: 'number', example: 3, description: 'Number of messages marked as read' }
        }
      }
    }
  },
  TestSendMessageRequest: {
    type: 'object',
    required: ['userId', 'message'],
    properties: {
      userId: {
        type: 'string',
        example: '507f1f77bcf86cd799439011',
        description: 'ID of the other participant (user if admin, admin if user)'
      },
      message: {
        type: 'string',
        example: 'Hello! This is a test message',
        description: 'Message content'
      }
    }
  },
  TestSendMessageResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Test message sent successfully' },
      data: {
        type: 'object',
        properties: {
          message: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
              user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              admin_id: { type: 'string', example: '507f1f77bcf86cd799439013' },
              message: { type: 'string', example: 'Hello! This is a test message' },
              sender_id: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  name: { type: 'string', example: 'Admin User' },
                  email: { type: 'string', example: 'admin@example.com' },
                  profile: { type: 'string', nullable: true, example: 'https://example.com/profile.jpg' }
                }
              },
              sender_role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
              is_read: { type: 'boolean', example: false },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' }
            }
          }
        }
      }
    }
  },

  // Video Schemas
  VideoStatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Video statistics retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          totalVideos: { type: 'number', example: 5 },
          published: { type: 'number', example: 4 },
          drafts: { type: 'number', example: 1 },
          totalViews: { type: 'number', example: 3990 }
        }
      }
    }
  },
  CreateVideoRequest: {
    type: 'object',
    required: ['title', 'category', 'video_url'],
    properties: {
      title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
      category: {
        type: 'string',
        enum: ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'],
        example: 'Sermon'
      },
      video_url: { type: 'string', example: 'https://example.com/video.mp4' },
      thumbnail_url: { type: 'string', nullable: true, example: 'https://example.com/thumbnail.jpg' },
      description: { type: 'string', nullable: true, example: 'A powerful sermon about faith in action' },
      duration: { type: 'string', nullable: true, example: '45:30' },
      status: {
        type: 'string',
        enum: ['published', 'draft'],
        example: 'draft'
      }
    }
  },
  UpdateVideoRequest: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
      category: {
        type: 'string',
        enum: ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'],
        example: 'Sermon'
      },
      video_url: { type: 'string', example: 'https://example.com/video.mp4' },
      thumbnail_url: { type: 'string', nullable: true, example: 'https://example.com/thumbnail.jpg' },
      description: { type: 'string', nullable: true, example: 'A powerful sermon about faith in action' },
      duration: { type: 'string', nullable: true, example: '45:30' }
    }
  },
  UpdateVideoStatusRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['published', 'draft'],
        example: 'published'
      }
    }
  },
  Video: {
    type: 'object',
    description: 'Video response format (controller transforms model fields to camelCase)',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
      category: {
        type: 'string',
        enum: ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'],
        example: 'Sermon'
      },
      videoUrl: { type: 'string', example: 'https://example.com/video.mp4', description: 'Transformed from video_url' },
      thumbnailUrl: { type: 'string', nullable: true, example: 'https://example.com/thumbnail.jpg', description: 'Transformed from thumbnail_url' },
      description: { type: 'string', nullable: true, example: 'A powerful sermon about faith in action' },
      duration: { type: 'string', nullable: true, example: '45:30', description: 'Format: "45:30" (MM:SS or HH:MM:SS)' },
      views: { type: 'number', example: 1250, default: 0 },
      status: {
        type: 'string',
        enum: ['published', 'draft'],
        example: 'published',
        default: 'draft'
      },
      uploadDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z', description: 'Transformed from createdAt' },
      uploadedBy: {
        type: 'object',
        nullable: true,
        description: 'Transformed from uploaded_by (populated user object)',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', nullable: true, example: 'admin@example.com' },
          profile: { type: 'string', nullable: true, example: 'https://example.com/profile.jpg' }
        }
      },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
      updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' }
    }
  },
  VideoUser: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
      category: {
        type: 'string',
        enum: ['Sermon', 'Worship', 'Teaching', 'Prayer', 'Documentary', 'Other'],
        example: 'Sermon'
      },
      videoUrl: { type: 'string', example: 'https://example.com/video.mp4' },
      thumbnailUrl: { type: 'string', nullable: true, example: 'https://example.com/thumbnail.jpg' },
      description: { type: 'string', nullable: true, example: 'A powerful sermon about faith in action' },
      duration: { type: 'string', nullable: true, example: '45:30' },
      views: { type: 'number', example: 1250 },
      uploadDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
      uploadedBy: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'Admin User' },
          profile: { type: 'string', nullable: true, example: 'https://example.com/profile.jpg' }
        }
      },
      createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' }
    }
  },
  VideosListAdminResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Videos retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          videos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sno: { type: 'number', example: 1 },
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
                category: { type: 'string', example: 'Sermon' },
                videoUrl: { type: 'string', example: 'https://example.com/video.mp4' },
                thumbnailUrl: { type: 'string', nullable: true },
                description: { type: 'string', nullable: true },
                duration: { type: 'string', example: '45:30' },
                views: { type: 'number', example: 1250 },
                status: { type: 'string', example: 'published' },
                uploadDate: { type: 'string', format: 'date-time' },
                uploadedBy: { 
                  type: 'object',
                  nullable: true,
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', nullable: true },
                    profile: { type: 'string', nullable: true }
                  }
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  VideosListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Videos retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          videos: {
            type: 'array',
            items: { $ref: '#/components/schemas/VideoUser' }
          },
          pagination: { $ref: '#/components/schemas/Pagination' }
        }
      }
    }
  },
  VideoResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Video retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          video: { $ref: '#/components/schemas/Video' }
        }
      }
    }
  },
  VideoUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Video retrieved successfully' },
      data: {
        type: 'object',
        properties: {
          video: { $ref: '#/components/schemas/VideoUser' }
        }
      }
    }
  },
  VideoStatusResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Video published successfully' },
      data: {
        type: 'object',
        properties: {
          video: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              title: { type: 'string', example: 'Sunday Sermon - Faith in Action' },
              status: { type: 'string', example: 'published' }
            }
          }
        }
      }
    }
  },
  VideoViewResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Video view incremented' },
      data: {
        type: 'object',
        properties: {
          views: { type: 'number', example: 1251 }
        }
      }
    }
  }
};

