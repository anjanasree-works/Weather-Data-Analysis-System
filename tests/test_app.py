import unittest
from unittest.mock import patch
import app as weather_app


class WeatherAppTests(unittest.TestCase):
    def setUp(self):
        self.client = weather_app.app.test_client()

    def test_homepage_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"SkyScope", response.data)

    def test_weather_endpoint_uses_demo_without_key(self):
        with patch.object(weather_app, "API_KEY", ""):
            response = self.client.get("/api/weather?city=Hyderabad")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["demo"])
        self.assertEqual(data["city"], "Hyderabad")
        self.assertEqual(len(data["forecast"]), 5)

    def test_empty_city_rejected(self):
        response = self.client.get("/api/weather?city=")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())


if __name__ == "__main__":
    unittest.main()
