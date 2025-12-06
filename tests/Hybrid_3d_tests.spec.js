import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('TN_01', () => {
  test('TN_01_1', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).fill('marius');
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).fill('marius');
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paš' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paš' }).fill('marius@edu.ku.lt');
    await page.getByRole('textbox', { name: 'Įveskite saugų slaptažodį:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite saugų slaptažodį:' }).fill('123456789');
    await page.getByRole('textbox', { name: 'Įveskite savo gimtadienį:' }).fill('2025-10-09');
    await page.getByLabel('Pasirinkite šalį:').selectOption('19');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
  });
  test('TN_01_2', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).press('CapsLock');
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).fill('p');
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).fill('p');
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paš' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paš' }).fill('p@gmail.com');
    await page.getByRole('textbox', { name: 'Įveskite saugų slaptažodį:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite saugų slaptažodį:' }).fill('0');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Vardo laukelis yra netinkamas')).toBeVisible();
    await expect(page.getByText('Pavardės laukelis yra')).toBeVisible();
    await expect(page.getByText('Slaptažodžio laukelis yra')).toBeVisible();
    await expect(page.getByText('Gimtadienio laukelis yra')).toBeVisible();
  });
});

test.describe('TN_02', () => {
  test('TN_02_1', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
    await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).fill('admin@edu.ku.lt');
    await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
    await page.getByRole('textbox', { name: 'Slaptažodis:' }).fill('123456789');
    await page.getByRole('button', { name: 'Prisijungti' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });
  test('TN_02_2', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
    await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).fill('dan@gmail.com');
    await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
    await page.getByRole('textbox', { name: 'Slaptažodis:' }).fill('123456');
    await page.getByRole('button', { name: 'Prisijungti' }).click();
    await expect(page.getByText('Netinkamas Elektroninis paš')).toBeVisible();
  });
  test('TN_02_3', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
    await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
    await page.getByRole('button', { name: 'Prisijungti' }).click();
    await expect(page.getByText('Elektroninio pašto laukelis')).toBeVisible();
    await expect(page.getByText('Slaptažodžio laukelis yra tu')).toBeVisible();
    await expect(page.getByText('Netinkamas Elektroninis paš')).toBeVisible();
  });
});

async function login(page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
  await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).fill('admin@edu.ku.lt');
  await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
  await page.getByRole('textbox', { name: 'Slaptažodis:' }).fill('123456789');
  await page.getByRole('button', { name: 'Prisijungti' }).click();
  await expect(page).toHaveURL('http://localhost:3000/dashboard');
}

test.describe('TN_03', () => {
  test('TN_03_1', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'PASKYRA' }).click();
    await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
    await page.locator('div').filter({ hasText: 'Įveskite savo vardą: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).fill('admin12');
    await page.locator('div').filter({ hasText: 'Įveskite savo pavardę: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).fill('admin12');
    await page.locator('div').filter({ hasText: 'Įveskite savo elektroninį paštą: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paštą' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paštą' }).fill('admin30@edu.ku.lt');
    await page.locator('div').filter({ hasText: 'Įveskite savo gimtadienį' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo gimtadienį' }).fill('2025-11-12');
    await page.getByLabel('Pasirinkite šalį:').selectOption('19');
    await page.getByRole('button', { name: 'Pateikti' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    await page.getByRole('button', { name: 'PASKYRA' }).click();
    await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
    await page.locator('div').filter({ hasText: 'Įveskite savo elektroninį paštą: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paštą' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo elektroninį paštą' }).fill('admin@edu.ku.lt');
    await page.getByRole('button', { name: 'Pateikti' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('TN_03_2', async ({ page }) => {
    await login(page);

    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'PASKYRA' }).click();
    await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
    await page.locator('div').filter({ hasText: 'Įveskite savo vardą: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).click();
    await page.getByRole('textbox', { name: 'Įveskite savo vardą:' }).fill('a');
    await page.locator('div').filter({ hasText: 'Įveskite savo pavardę: Redaguoti' }).locator('button').click();
    await page.getByRole('textbox', { name: 'Įveskite savo pavardę:' }).fill('a');
    await page.getByRole('button', { name: 'Pateikti' }).click();
    await expect(page.getByText('Vardo laukelis yra netinkamas')).toBeVisible();
    await expect(page.getByText('Pavardės laukelis yra')).toBeVisible();
  });
});
test.describe.serial('TN_04', () => {
  test('TN_04_1', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Įkelti modelį' }).click();
    const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill('modelis');
    await page.getByRole('button', { name: 'Įkelti' }).click();
    await expect(page.getByRole('heading', { name: 'modelis' })).toBeVisible();
  });
  test('TN_04_2', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Sukurti produktą' }).click();
    await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
    await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
    await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
    await page.locator('#title_color').check();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Prožektorius').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Supanti šviesa').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Dėmesio taškas').click();
    await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
    await page.getByLabel('Pasirinkite foną:').selectOption('2');
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill('produktas');
    await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
    await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p>');
    await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
    await page.getByRole('button', { name: 'Pateikti' }).click();
  });
  test('TN_04_3', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Mano produktai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Redaguoti' }).click();
    await page.getByLabel('Pasirinkite foną:').selectOption('1');
    await page.getByRole('button', { name: 'Atnaujinti' }).click();
  });
  test('TN_04_4', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'KATALOGAI' }).click();
    await page.getByRole('link', { name: 'Sukurti katalogą' }).click();
    await page.getByLabel('Pasirinkite produktą:').selectOption({ label: 'produktas' });
    await page.getByRole('button', { name: 'Pridėti' }).click();
    await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).click();
    await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).fill('Katalogas');
    await page.getByRole('button', { name: 'Pateikti' }).click();
  });
  test('TN_04_5', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'KATALOGAI' }).click();
    await page.getByRole('link', { name: 'Mano katalogai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Redaguoti' }).click();
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
    await page.locator('#settings_row canvas').click({
      position: {
        x: 131,
        y: 17
      }
    });
    await page.getByRole('button', { name: 'Atnaujinti' }).click();
  });
  test('TN_04_6', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'KATALOGAI' }).click();
    await page.getByRole('link', { name: 'Mano katalogai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Peržvelgti' }).click();
    expect(page.url()).toContain('/catalog/created');
  });
  test('TN_04_7', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'KATALOGAI' }).click();
    await page.getByRole('link', { name: 'Mano katalogai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Ištrinti' }).click();
  });
  test('TN_04_8', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Mano produktai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Ištrinti' }).click();
  });
  test('TN_04_9', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Ištrinti' }).click();
  });
});
test.describe.serial('TN_05', () => {
  test('TN_05_1', async ({ page }) => {
    await login(page);

    async function create_models(...modelNames) {
      for (let model of modelNames) {
        await page.getByRole('button', { name: 'MODELIAI' }).click();
        await page.getByRole('link', { name: 'Įkelti modelį' }).click();
        const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
        await page.locator('input[type="file"]').setInputFiles(filePath);
        await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill(`${model}`);
        await page.getByRole('button', { name: 'Įkelti' }).click();
      }
    }
    await create_models('ABCD', 'BCDA', 'CDAB', 'DABC');
  });
  test('TN_05_2', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.locator('#filter').selectOption('newest');
    await page.getByRole('button', { name: 'Filtruoti' }).click();
    await expect(page.getByRole('heading', { name: 'DABC' })).toBeVisible();
  });
  test('TN_05_3', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.locator('#filter').selectOption('oldest');
    await page.getByRole('button', { name: 'Filtruoti' }).click();
    await expect(page.getByRole('heading', { name: 'ABCD' })).toBeVisible();
  });
  test('TN_05_4', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.locator('#filter').selectOption('a-z');
    await page.getByRole('button', { name: 'Filtruoti' }).click();
    await expect(page.getByRole('heading', { name: 'ABCD' })).toBeVisible();
  });
  test('TN_05_5', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.locator('#filter').selectOption('z-a');
    await page.getByRole('button', { name: 'Filtruoti' }).click();
    await expect(page.getByRole('heading', { name: 'ABCD' })).toBeVisible();
  });
  test('TN_05_6', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.locator('#filter').selectOption('a-z');
    await page.getByRole('button', { name: 'Filtruoti' }).click();
    await expect(page.getByRole('heading', { name: 'DABC' })).toBeVisible();

    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Mano modeliai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();
    }
  });
});
test.describe.serial('TN_06', () => {
  test('TN_06_1', async ({ page }) => {
    await login(page);

    async function create_models(...modelNames) {
      for (let model of modelNames) {
        await page.getByRole('button', { name: 'MODELIAI' }).click();
        await page.getByRole('link', { name: 'Įkelti modelį' }).click();
        const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
        await page.locator('input[type="file"]').setInputFiles(filePath);
        await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill(`${model}`);
        await page.getByRole('button', { name: 'Įkelti' }).click();
      }
    }
    await create_models('A111', 'B111', 'C111', 'D111', 'E111', 'F111', 'G111', 'H111', 'I111', 'J111');
  });
  test('TN_06_2', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.getByRole('link', { name: '2' }).click();
    await expect(page).toHaveURL('http://localhost:3000/model/dashboard/1/none');;

    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Mano modeliai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();
    }
  });
});
test.describe.serial('TN_07', () => {
  test('TN_07_1', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Įkelti modelį' }).click();
    const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill('modelis');
    await page.getByRole('button', { name: 'Įkelti' }).click();
    await expect(page.getByRole('heading', { name: 'modelis' })).toBeVisible();

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Sukurti produktą' }).click();
    await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
    await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
    await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
    await page.locator('#title_color').check();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Prožektorius').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Supanti šviesa').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Dėmesio taškas').click();
    await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
    await page.getByLabel('Pasirinkite foną:').selectOption('2');
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill('produktas');
    await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
    await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<div class="highlights"><h2>Key features</h2><ul><li>Powerful chip for fast performance</li> <li>High‑quality camera with advanced HDR</li><li>Touch ID for secure authentication</li><li>Long battery life in a compact design</li><li>Water and dust resistance</li></ul></div>');
    await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
    await page.getByRole('button', { name: 'Pateikti' }).click();
    await expect(page.getByRole('heading', { name: 'produktas' })).toBeVisible();

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Mano produktai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Ištrinti' }).click();
  });
  test('TN_07_2', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'PRODUKTAI' }).click();
    await page.getByRole('link', { name: 'Sukurti produktą' }).click();
    await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
    await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
    await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
    await page.locator('#title_color').check();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Prožektorius').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Supanti šviesa').click();
    await page.getByRole('button', { name: 'Pridėti elementą' }).click();
    await page.getByText('Dėmesio taškas').click();
    await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
    await page.getByLabel('Pasirinkite foną:').selectOption('2');
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
    await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill('produktas');
    await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
    await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<section class="product" aria-labelledby="iphone-se-title">\n  <h1 id="iphone-se-title">Apple iPhone SE</h1>\n\n  <p class="tagline">Small size. Big power. Classic design with modern performance.</p>\n\n  <div class="highlights">\n    <h2>Key features</h2>\n    <ul>\n      <li>Powerful chip for fast performance</li>\n      <li>High‑quality camera with advanced HDR</li>\n      <li>Touch ID for secure authentication</li>\n      <li>Long battery life in a compact design</li>\n      <li>Water and dust resistance</li>\n    </ul>\n  </div>\n\n  <div class="cta">\n    <a href="#buy" class="btn btn-primary">Buy now</a>\n    <a href="#specs" class="btn btn-secondary">View full specs</a>\n  </div>\n\n  <article id="overview">\n    <h2>Overview</h2>\n    <p>\n      iPhone SE delivers powerful performance in a pocket‑friendly design. Enjoy smooth iOS,\n      reliable battery life, and a camera that’s ready for everyday moments.\n    </p>\n  </article>\n\n  <section id="specs" aria-labelledby="specs-title">\n    <h2 id="specs-title">Specifications</h2>\n    <table class="specs" role="table">\n      <tbody>\n        <tr>\n          <th scope="row">Display</th>\n          <td>4.7-inch Retina HD</td>\n        </tr>\n        <tr>\n          <th scope="row">Authentication</th>\n          <td>Touch ID</td>\n        </tr>\n        <tr>\n          <th scope="row">Camera</th>\n          <td>12MP rear, 4K video</td>\n        </tr>\n        <tr>\n          <th scope="row">Water resistance</th>\n          <td>Rated for everyday spills</td>\n        </tr>\n        <tr>\n          <th scope="row">Colors</th>\n          <td>Black, White, Red</td>\n        </tr>\n        <tr>\n          <th scope="row">Storage</th>\n          <td>64GB / 128GB / 256GB</td>\n        </tr>\n      </tbody>\n    </table>\n  </section>\n\n  <footer class="disclaimer">\n    <p>Some features vary by model and region. Check local availability.</p>\n  </footer>\n</section>');
    await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
    await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
    await page.getByRole('button', { name: 'Pateikti' }).click();
    await expect(page.getByText('*Aprašymo laukelis yra')).toBeVisible();

    await page.getByRole('button', { name: 'MODELIAI' }).click();
    await page.getByRole('link', { name: 'Mano modeliai' }).click();
    await page.getByRole('button', { name: 'Veiksmas' }).first().click();
    await page.getByRole('link', { name: 'Ištrinti' }).click();
  });
  test.describe.serial('TN_08', () => {
    test('TN_08_1', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Įkelti modelį' }).click();
      const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill('modelis');
      await page.getByRole('button', { name: 'Įkelti' }).click();
      await expect(page.getByRole('heading', { name: 'modelis' })).toBeVisible();

      await page.getByRole('button', { name: 'PRODUKTAI' }).click();
      await page.getByRole('link', { name: 'Sukurti produktą' }).click();
      await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
      await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
      await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
      await page.locator('#title_color').check();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Prožektorius').click();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Supanti šviesa').click();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Dėmesio taškas').click();
      await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
      await page.getByLabel('Pasirinkite foną:').selectOption('2');
      await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
      await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill('produktas');
      await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
      await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p>');
      await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
      await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
      await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
      await page.getByRole('button', { name: 'Pateikti' }).click();
    });
    test('TN_08_2', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Sukurti katalogą' }).click();
      await page.getByLabel('Pasirinkite produktą:').selectOption({ label: 'produktas' });
      await page.getByRole('button', { name: 'Pridėti' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).fill('Katalogas');
      await page.getByRole('button', { name: 'Pateikti' }).click();

      await page.getByRole('button', { name: 'PRODUKTAI' }).click();
      await page.getByRole('link', { name: 'Mano produktai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Mano modeliai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();
    });
  });
  test.describe.serial('TN_09', () => {
    test('TN_09_1', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'PASKYRA' }).click();
      await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
      const filePath = path.join(__dirname, 'test_data', 'istockphoto-1618846975-612x612.jpg');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('button', { name: 'Atnaujinti nuotrauką' }).click();
    });
    test('TN_09_2', async ({ page }) => {
      await login(page);
      await page.getByRole('button', { name: 'PASKYRA' }).click();
      await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
      const filePath = path.join(__dirname, 'test_data', 'Rotating_earth_(large).gif');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('button', { name: 'Atnaujinti nuotrauką' }).click();
      await expect(page.getByText('*Tinka tik png, jpg ir jpeg')).toBeVisible();
    });
    test('TN_09_3', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'PASKYRA' }).click();
      await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
      const filePath = path.join(__dirname, 'test_data', 'abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai.jpg');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('button', { name: 'Atnaujinti nuotrauką' }).click();
      await expect(page.getByText('*Nuotrauka per didelė')).toBeVisible();
    });
  });
  test.describe.serial('TN_10', () => {
    test('TN_10_1', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Įkelti modelį' }).click();
      const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill('modelis');
      await page.getByRole('button', { name: 'Įkelti' }).click();
      await expect(page.getByRole('heading', { name: 'modelis' })).toBeVisible();

      await page.getByRole('button', { name: 'PRODUKTAI' }).click();
      await page.getByRole('link', { name: 'Sukurti produktą' }).click();
      await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
      await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
      await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
      await page.locator('#title_color').check();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Prožektorius').click();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Supanti šviesa').click();
      await page.getByRole('button', { name: 'Pridėti elementą' }).click();
      await page.getByText('Dėmesio taškas').click();
      await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
      await page.getByLabel('Pasirinkite foną:').selectOption('2');
      await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
      await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill('produktas');
      await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
      await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p>');
      await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
      await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
      await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
      await page.getByRole('button', { name: 'Pateikti' }).click();

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Sukurti katalogą' }).click();
      await page.getByLabel('Pasirinkite produktą:').selectOption({ label: 'produktas' });
      await page.getByRole('button', { name: 'Pridėti' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).fill('Katalogas');
      await page.getByRole('button', { name: 'Pateikti' }).click();

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Mano katalogai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).click();
      await page.getByText('Dalintis', { exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Dalintis katalogu' })).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Mano katalogai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();

      await page.getByRole('button', { name: 'PRODUKTAI' }).click();
      await page.getByRole('link', { name: 'Mano produktai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Mano modeliai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();
    });
  });
  test.describe.serial('TN_11', () => {
    test('TN_11_1', async ({ page }) => {
      await login(page);

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Įkelti modelį' }).click();
      const filePath = path.join(__dirname, 'test_data', 'iphone_15_pro_max.glb');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('textbox', { name: 'Įveskite modelio pavadinimą:' }).fill('modelis');
      await page.getByRole('button', { name: 'Įkelti' }).click();
      await expect(page.getByRole('heading', { name: 'modelis' })).toBeVisible();

      async function create_product(...name) {
        for (let n of name) {
          await page.getByRole('button', { name: 'PRODUKTAI' }).click();
          await page.getByRole('link', { name: 'Sukurti produktą' }).click();
          await page.getByRole('checkbox', { name: 'Tamsios rodyklės' }).check();
          await page.getByRole('checkbox', { name: 'Tamsūs dėmesio taškai Tamsus' }).check();
          await page.getByRole('checkbox', { name: 'Tamsi meniu ikona' }).check();
          await page.locator('#title_color').check();
          await page.getByRole('button', { name: 'Pridėti elementą' }).click();
          await page.getByText('Prožektorius').click();
          await page.getByRole('button', { name: 'Pridėti elementą' }).click();
          await page.getByText('Supanti šviesa').click();
          await page.getByRole('button', { name: 'Pridėti elementą' }).click();
          await page.getByText('Dėmesio taškas').click();
          await page.getByLabel('Pasirinkite modelį:').selectOption({ label: 'modelis' })
          await page.getByLabel('Pasirinkite foną:').selectOption('2');
          await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).click();
          await page.getByRole('textbox', { name: 'Produkto pavadinimas:' }).fill(`${n}`);
          await page.getByRole('textbox', { name: 'Aprašymas:' }).click();
          await page.getByRole('textbox', { name: 'Aprašymas:' }).fill('<h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p><h4>Pavadinimas</h4><p>Tekstas</p>');
          await page.getByRole('button', { name: 'Pridėti', exact: true }).click();
          await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).click();
          await page.getByRole('spinbutton', { name: 'Produkto Kaina:' }).fill('200');
          await page.getByRole('button', { name: 'Pateikti' }).click();
        }
      }
      await create_product('produktas', 'produktas2');

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Sukurti katalogą' }).click();
      await page.getByLabel('Pasirinkite produktą:').selectOption({ label: 'produktas' });
      await page.getByRole('button', { name: 'Pridėti' }).click();
      await page.getByLabel('Pasirinkite produktą:').selectOption({ label: 'produktas2' });
      await page.getByRole('button', { name: 'Pridėti' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).click();
      await page.getByRole('textbox', { name: 'Katalogo pavadinimas:' }).fill('Katalogas');
      await page.getByRole('button', { name: 'Pateikti' }).click();

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Mano katalogai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).click();
      await page.getByRole('link', { name: 'Peržvelgti' }).click();
      await page.getByRole('button', { name: 'Navigacija' }).click();
      await page.getByRole('button', { name: '2' }).click();
      await expect(page.getByRole('heading', { name: 'produktas2' })).toBeVisible();

      await page.goto('http://localhost:3000/');

      await page.getByRole('button', { name: 'KATALOGAI' }).click();
      await page.getByRole('link', { name: 'Mano katalogai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();

      for (let i = 0; i < 2; i++) {
        await page.getByRole('button', { name: 'PRODUKTAI' }).click();
        await page.getByRole('link', { name: 'Mano produktai' }).click();
        await page.getByRole('button', { name: 'Veiksmas' }).first().click();
        await page.getByRole('link', { name: 'Ištrinti' }).click();
      }

      await page.getByRole('button', { name: 'MODELIAI' }).click();
      await page.getByRole('link', { name: 'Mano modeliai' }).click();
      await page.getByRole('button', { name: 'Veiksmas' }).first().click();
      await page.getByRole('link', { name: 'Ištrinti' }).click();
    });
  });
  test.describe.serial('TN_12', () => {
    test('TN_12_1', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
      await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).fill('marius@edu.ku.lt');
      await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
      await page.getByRole('textbox', { name: 'Slaptažodis:' }).fill('123456789');
      await page.getByRole('button', { name: 'Prisijungti' }).click();

      await page.getByRole('button', { name: 'PASKYRA' }).click();
      await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
      await page.getByRole('link', { name: 'Naikinti paskyrą' }).click();
      await page.getByRole('textbox', { name: 'Patvirtinkite savo' }).click();
      await page.getByRole('textbox', { name: 'Patvirtinkite savo' }).fill('marus@edu.ku.lt');
      await page.getByRole('button', { name: 'Ištrinti' }).click();
      await expect(page.getByText('*Elektroninio pašto adresai')).toBeVisible();
    });
    test('TN_12_2', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).click();
      await page.getByRole('textbox', { name: 'Elektroninis paštas:' }).fill('marius@edu.ku.lt');
      await page.getByRole('textbox', { name: 'Slaptažodis:' }).click();
      await page.getByRole('textbox', { name: 'Slaptažodis:' }).fill('123456789');
      await page.getByRole('button', { name: 'Prisijungti' }).click();

      await page.getByRole('button', { name: 'PASKYRA' }).click();
      await page.getByRole('link', { name: 'Paskyros nustatymai' }).click();
      await page.getByRole('link', { name: 'Naikinti paskyrą' }).click();
      await page.getByRole('textbox', { name: 'Patvirtinkite savo' }).click();
      await page.getByRole('textbox', { name: 'Patvirtinkite savo' }).fill('marius@edu.ku.lt');
      await page.getByRole('button', { name: 'Ištrinti' }).click();
    });
  });
});