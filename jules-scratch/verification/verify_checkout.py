import re
from playwright.sync_api import sync_playwright, Page, expect

def run(page: Page):
    """
    This script verifies the entire checkout flow.
    1. Signs up a new user.
    2. Adds a product to the cart.
    3. Fills out the checkout form.
    4. Submits the order.
    5. Verifies the redirection and takes a screenshot of the profile page.
    """
    base_url = "http://localhost:5173"

    # --- 1. Sign Up a new user ---
    page.goto(f"{base_url}/auth")

    # Click the "Cadastre-se" (Sign up) button to switch to the sign-up form
    page.get_by_role("button", name="Cadastre-se").click()

    # Fill out the sign-up form
    page.get_by_label("Nome Completo").fill("Test User")
    page.get_by_label("Email").fill("testuser@example.com")
    page.get_by_label("Senha", exact=True).fill("password123")
    page.get_by_label("Confirmar Senha").fill("password123")
    page.get_by_role("button", name="Criar Conta").click()

    # Wait for the signup to complete and navigate to the home page.
    # A toast should appear, we can wait for it.
    expect(page.get_by_text("Conta criada com sucesso!")).to_be_visible()
    expect(page).to_have_url(f"{base_url}/")

    # --- 2. Log Out ---
    # Find the user avatar button in the header and click it to open the dropdown
    page.get_by_role("button", name="Open user menu").click()
    # Find the "Sair" (Logout) button and click it
    page.get_by_role("menuitem", name="Sair").click()
    # Verify that we are logged out by checking for the login button in the header
    expect(page.get_by_role("button", name="Entrar")).to_be_visible()

    # --- 3. Log In ---
    page.goto(f"{base_url}/auth")
    page.get_by_label("Email").fill("testuser@example.com")
    page.get_by_label("Senha", exact=True).fill("password123")
    page.get_by_role("button", name="Entrar").click()

    # Wait for login to complete and navigate to the home page
    expect(page.get_by_text("Login realizado com sucesso!")).to_be_visible()
    expect(page).to_have_url(f"{base_url}/")

    # --- 4. Add a product to the cart ---
    # Find the first product link on the home page and click it.
    # This is a bit brittle, but good enough for a verification script.
    page.locator('.grid.grid-cols-2 a').first.click()

    # Wait for the product detail page to load
    expect(page).to_have_url(re.compile(r'/products/'))

    # Add the product to the cart
    page.get_by_role("button", name="Adicionar ao Carrinho").click()

    # A toast should appear confirming the item was added.
    expect(page.get_by_text("Produto adicionado ao carrinho!")).to_be_visible()

    # --- 3. Navigate to Checkout ---
    page.goto(f"{base_url}/checkout")

    # --- 4. Fill the checkout form ---
    # The form should be pre-filled from the profile, but we'll fill it just in case.
    expect(page.get_by_label("Nome Completo")).to_have_value("Test User")
    page.get_by_label("Telefone / WhatsApp").fill("11987654321")
    page.get_by_label("Endereço Completo").fill("Rua dos Testes, 123, Bairro Teste, São Paulo - SP, 01234-567")

    # --- 5. Submit the order ---
    page.get_by_role("button", name="Finalizar Compra").click()

    # --- 6. Verify the result ---
    # A success toast should appear
    expect(page.get_by_text("Pedido realizado com sucesso!")).to_be_visible()

    # We should be redirected to the profile page
    expect(page).to_have_url(f"{base_url}/profile")
    expect(page.get_by_role("heading", name="Meu Perfil")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run(page)
        browser.close()
