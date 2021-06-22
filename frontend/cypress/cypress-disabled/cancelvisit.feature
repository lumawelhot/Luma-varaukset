Feature: As a teacher I want to cancel my booking

Scenario: Event can be booked when booking button is clicked
    Given I have made a booking for an available event
    Then I can cancel that booking
    And the event is available for booking