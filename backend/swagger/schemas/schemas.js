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
        type: 'boolean',
        example: false
      },
      device_type: {
        type: 'string',
        enum: ['android', 'ios'],
        nullable: true,
        example: 'android'
      },
      role: {
        type: 'string',
        enum: ['admin', 'user'],
        example: 'user'
      },
      church_id: {
        type: 'string',
        nullable: true,
        example: '507f1f77bcf86cd799439011'
      },
      app_language: {
        type: 'string',
        example: 'en'
      },
      is_community_created: {
        type: 'number',
        example: 0
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
    required: ['name', 'mobile', 'countryCode', 'password', 'confirmPassword'],
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
      countryCode: {
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
      deviceType: {
        type: 'string',
        enum: ['android', 'ios'],
        nullable: true,
        example: 'android'
      },
      deviceToken: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcmToken: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      },
      appLanguage: {
        type: 'string',
        default: 'en',
        example: 'en'
      }
    }
  },
  SigninRequest: {
    type: 'object',
    required: ['mobile', 'countryCode', 'password'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      countryCode: {
        type: 'string',
        example: '+1'
      },
      password: {
        type: 'string',
        example: 'password123'
      },
      deviceType: {
        type: 'string',
        enum: ['android', 'ios'],
        nullable: true,
        example: 'android'
      },
      deviceToken: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcmToken: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      }
    }
  },
  VerifyOTPRequest: {
    type: 'object',
    required: ['mobile', 'countryCode', 'otp'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      countryCode: {
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
    required: ['mobile', 'countryCode'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      countryCode: {
        type: 'string',
        example: '+1'
      }
    }
  },
  SocialLoginRequest: {
    type: 'object',
    required: ['socialToken', 'socialType'],
    properties: {
      socialToken: {
        type: 'string',
        example: 'social-token-123'
      },
      socialType: {
        type: 'string',
        enum: ['google', 'facebook', 'apple'],
        example: 'google'
      },
      name: {
        type: 'string',
        nullable: true,
        example: 'John Doe'
      },
      email: {
        type: 'string',
        nullable: true,
        example: 'john.doe@example.com'
      },
      deviceType: {
        type: 'string',
        enum: ['android', 'ios'],
        nullable: true,
        example: 'android'
      },
      deviceToken: {
        type: 'string',
        nullable: true,
        example: 'device-token-123'
      },
      fcmToken: {
        type: 'string',
        nullable: true,
        example: 'fcm-token-123'
      }
    }
  },
  ForgotPasswordRequest: {
    type: 'object',
    required: ['mobile', 'countryCode'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      countryCode: {
        type: 'string',
        example: '+1'
      }
    }
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['mobile', 'countryCode', 'otp', 'newPassword', 'confirmPassword'],
    properties: {
      mobile: {
        type: 'string',
        example: '1234567890'
      },
      countryCode: {
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
    required: ['appLanguage'],
    properties: {
      appLanguage: {
        type: 'string',
        example: 'en'
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
      user_id: {
        type: 'string',
        example: '507f1f77bcf86cd799439012'
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
        format: 'date',
        example: '2024-01-07'
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
        format: 'date',
        example: '2024-01-07'
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
        format: 'date',
        example: '2024-01-07'
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
          refreshToken: {
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
    required: ['refreshToken'],
    properties: {
      refreshToken: {
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
    properties: {
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      mobile: { type: 'string', example: '1234567890' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
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
      contactEmail: { type: 'string', example: 'john@example.com' },
      contactMobile: { type: 'string', example: '1234567890' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor'
      },
      assignedTo: { type: 'string', example: '507f1f77bcf86cd799439012' },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        example: 'pending'
      },
      dueDate: { type: 'string', format: 'date-time' },
      description: { type: 'string', example: 'Follow up needed' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateFollowUpRequest: {
    type: 'object',
    required: ['name', 'contactEmail', 'contactMobile', 'type'],
    properties: {
      name: { type: 'string', example: 'John Doe' },
      contactEmail: { type: 'string', format: 'email', example: 'john@example.com' },
      contactMobile: { type: 'string', example: '1234567890' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor'
      },
      assignedTo: { type: 'string', example: '507f1f77bcf86cd799439012' },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        example: 'pending'
      },
      dueDate: { type: 'string', format: 'date-time' },
      description: { type: 'string', example: 'Follow up needed' }
    }
  },
  UpdateFollowUpRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'John Doe' },
      contactEmail: { type: 'string', format: 'email', example: 'john@example.com' },
      contactMobile: { type: 'string', example: '1234567890' },
      type: {
        type: 'string',
        enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
        example: 'New Visitor'
      },
      assignedTo: { type: 'string', example: '507f1f77bcf86cd799439012' },
      dueDate: { type: 'string', format: 'date-time' },
      description: { type: 'string', example: 'Follow up needed' }
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
  UpdatePrayerRequestRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'John Doe' },
      mobileNumber: { type: 'string', example: '1234567890' },
      dialCode: { type: 'string', example: '+1' },
      description: { type: 'string', example: 'Updated description' },
      date: { type: 'string', format: 'date', example: '2024-01-20' },
      time: { type: 'string', example: '11:00 AM' }
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
      status: {
        type: 'string',
        enum: ['published', 'draft'],
        example: 'published'
      },
      uploadDate: { type: 'string', format: 'date-time', example: '2024-01-15T00:00:00.000Z' },
      uploadedBy: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          name: { type: 'string', example: 'Admin User' },
          email: { type: 'string', example: 'admin@example.com' },
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
                uploadedBy: { type: 'object' }
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

