"""
This script checks the PEWI GHG simulated data before it is sent to the server.
After checking the data, it is saved in the same directory as the index.html as ghgData.csv.
Created on: 02/07/2025
author: <NAME> Richard Magala
email; magalarich20@gmail.com
to rerun on a different machine use;
pip install -r requirements.txt
"""
import os
import shutil
from typing import Union
from xlwings import view
import pandas as pd
from numpy import ndarray
from os.path import (join, dirname, realpath)
import logging
import xlwings as xw
from wrangler_helper import sheet_names_values as sheet_data

logging.basicConfig(level=logging.INFO)
baseDir = dirname(realpath(__file__))

# insert file where the index.html is located
fileName = join(baseDir, 'ghgData.csv')

ExpectedColumns = {'to_carb', 'soil_type', 'ch4_kg_ha_yr', 'TopN2O', 'kpi',
                   'Whole_repsiration', 'precipitation_level', 'land_use',
                   'land_use_code'}

landUSes = {'Conservation forest',
            'Conventional forest',
            'Mixed fruits and vegetables',
            'Permanent pasture',
            'alfalfa',
            'conservationCorn',
            'conservationSoybean',
            'conventionalCorn',
            'conventionalSoybean',
            'grassHay',
            'prairie',
            'shortRotationWoodyBioenergy',
            'switchgrass'}

LAND_USE_CODES = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14}

PRECIPITATION_LEVELS = {24.58, 28.18, 30.39, 32.16, 34.34, 36.47, 45.1, 37.}

SOIL = {'M', 'Q', 'A', 'O', 'C', 'N', 'B', 'L', 'K', 'D', 'G', 'Y', 'T'}


def _check_values(values: Union[ndarray, list, tuple], category: str) -> None:
    """
    Validates that the provided values match the expected categories and their associated treatment/factor levels.

    :param values: A collection of values to be checked. Must be a list, numpy array (ndarray), pandas Series, or tuple.
    :param category: The category of the values, which must be one of ['soil', 'precipitation', 'land_use', 'land use].
    :raises AssertionError: If `category` is not a string, or if `values` is not a valid collection type.
    :raises ValueError: If `category` is not among the expected categories or if any expected values are missing.
    :return: None
    """
    assert isinstance(category, str), "category must be a string"
    categories = ['soil', 'precipitation', 'land_use', 'land use']
    categories = [i.lower() for i in categories]
    if category.lower() not in categories:
        raise ValueError(f'category should be any of of: {categories}')

    pick_category = dict(zip(categories, [SOIL, PRECIPITATION_LEVELS, LAND_USE_CODES, LAND_USE_CODES]))[
        category.lower()]

    assert isinstance(values,
                      (list, ndarray, pd.Series, tuple)), (f"Values must be a list, np.ndarray, pd.Series, "
                                                           f"or tuple. not: {type(values)}")
    uniq_vals = set(values)

    intersect = uniq_vals.intersection(pick_category)

    dif = pick_category.difference(uniq_vals)

    if len(intersect) != len(pick_category):
        raise ValueError(f"{category} is missing some factor levels `{dif}`")


def load_and_clean(data=None, view_in_excel: bool = False, **kwargs) -> pd.DataFrame:
    """"checks for duplicates in the data to send to the server"""
    file_name = kwargs.get('file_name', fileName)
    path = kwargs.get('path', 'kpi.csv')
    if data is not None:
        df = data.copy()
    else:
        df = pd.read_csv(path)
    # check if all columns are in the data frame
    interSec = df.columns.intersection(ExpectedColumns)

    if len(interSec) != len(ExpectedColumns):
        seTeXP = set(ExpectedColumns)
        dif = seTeXP.difference(df.columns)
        raise ValueError(f'Columns do not match, expected columns:{ExpectedColumns}, \nmissing{dif}')
    df['land_use'] = df['land_use'].replace({'1e-10': 'Permanent pasture'})

    if 'Unnamed: 0' in df.columns:
        df.drop('Unnamed: 0', axis=1, inplace=True)
    data = df.drop_duplicates(subset=['land_use_code', 'precipitation_level', 'soil_type'])

    _check_values(data.land_use_code, category='land_use')
    land_use_codes = data.land_use_code.unique()

    def query_data(code):
        return data[data['land_use_code'] == code].copy()

    # each land use should have all the factor levels
    for code_ in land_use_codes:
        logging.info(f"checking {code_}")
        cdata = query_data(code_)
        # check precipitation
        _check_values(cdata.precipitation_level, category='precipitation')
        # check land use codes

        # check SOIL types
        _check_values(cdata.soil_type, category='SOIL')
        logging.info(f"checking factor levels completed successfully")
    data.reset_index(drop=True, inplace=True)
    data.to_csv(file_name, index=False)
    logging.info(f"data successfully saved to {file_name}")
    if view_in_excel:
        view(data, table=kwargs.get('table', True))
    return data


def unpack_dicts(_dicts):
    if len(_dicts) == 1:
        return _dicts[0]
    em = {}

    for d in _dicts:
        em |= d

    return em


# Load an Excel file into a pandas DataFrame
df = pd.read_excel('edited_budgets.xlsx', sheet_name='C following SB')

Columns = ['LU_ID', 'Land-Use', 'Sub Crop']

Example_values = {'LU_ID': 1, 'Land-Use': 'Conservation Soybean', 'Sub Crop': 'corn aftersoy'}


def update_excel_book(_data, _book_name='PEWI Budgets 2024$ - 2025$ (021425).xlsx', sheet_name='C following SB'):
    """add an Excel sheet to an existing one just to keep all the data in one place"""
    # Load the workbook
    app = xw.App(visible=False)  # Set visible to False to not show the Excel application
    book = app.books.open(_book_name)

    # Check if the sheet exists, and if not, add it
    if sheet_name in [sheet.name for sheet in book.sheets]:
        sheet = book.sheets[sheet_name]
    else:
        sheet = book.sheets.add(sheet_name)

    # Clear any existing content if you want to overwrite completely
    sheet.clear_contents()

    # Write DataFrame to the sheet
    sheet.range('A1').options(index=False).value = _data

    # Save and close
    book.save()
    book.close()
    app.quit()


def add_columns(data, values: dict = None) -> pd.DataFrame:
    assert isinstance(values, dict), f"Expected dict but got {type(values)}"
    data = data.copy()
    _columns = list(values.keys())
    _values = list(values.values())
    if len(_values) != len(_columns):
        raise ValueError(f"values{_values} not equal to columns: {_columns}")
    data[_columns] = _values
    return data


def update_edits(book_path):
    list_data = []
    for sheet_name in sheet_data:
        logging.info(f"Processing sheet '{sheet_name}'..")
        data = pd.read_excel(book_path, sheet_name=sheet_name)
        data = add_columns(data, values=sheet_data[sheet_name])
        if 'Time - Cost Type' in data.columns:  # for now, let's leave out uncompleted dataset
            data = data.dropna(subset='Time - Cost Type')
        # drop un named columns
        data = data.loc[:, ~data.columns.str.contains('^Unnamed')]
        list_data.append(data)
        update_excel_book(data, _book_name=book_path, sheet_name=sheet_name)

    logging.info(f"updates completed successfully")
    return pd.concat(list_data)


def update_units(book_path):
    # filter out per cost per bushel, cost per acre
    list_data = []
    annual_sheets = ['C following SB',
                     'C following C',
                     'Conservation C',
                     'SB following C',
                     'Conservation SB', ]
    for sheet_name in sheet_data:
        print(sheet_name)
        if sheet_name in annual_sheets:
            logging.info(f"Processing sheet '{sheet_name}'..")
            data = pd.read_excel(book_path, sheet_name=sheet_name)
            dataa = add_columns(data, values=sheet_data[sheet_name])
            if 'Action - Cost Type' in data.columns:  # for now, let's leave out uncompleted dataset
                data = dataa[dataa['Action - Cost Type'].isin(["Per acre"])].copy()

                bushel = dataa[dataa['Action - Cost Type'].isin(['Per bushel'])]
                if not bushel.empty:
                    data['cost_per_unit'] = bushel['cost_per_acre'].iloc[0]
                else:
                    data['cost_per_bushel'] = None  # or some default value
            data['units'] = 'bushels'

            # drop un named columns
            data = data.loc[:, ~data.columns.str.contains('^Unnamed')]
            # add for switchgrass

            list_data.append(data)

    logging.info(f"updates completed successfully")

    # add for switchgrass
    def add_cost_per_unit(_sheet_name=None, cost_per_acre=None, units=None, cost_per_unit=None):
        """
        copy some values from the annuals
        :param _sheet_name:
        :param per_acre:
        :return:
        """
        sd = list_data[0].copy()
        if sd.empty:
            sd = list_data[1].copy()
        swg = sd.copy()
        swg['cost_per_unit'] = cost_per_unit
        swg['cost_per_acre'] = cost_per_acre
        swg['units'] = units
        ValueS = sheet_data.get(_sheet_name) or _sheet_name
        swg = add_columns(swg, values=ValueS)
        swg.dropna(axis=1, inplace=True)
        return swg

    # add switch grass
    switch = add_cost_per_unit(_sheet_name='Switchgrass', cost_per_acre=137, cost_per_unit=137, units='acre')
    list_data.append(switch)
    # add short rotation woody bioenergy
    swb = add_cost_per_unit(_sheet_name='SRWC ', cost_per_acre=406, cost_per_unit=63.45, units='Ton')
    list_data.append(swb)
    # add permanent pasture
    ps = add_cost_per_unit(_sheet_name='Perm Pasture', cost_per_acre=None, cost_per_unit=3496.81, units='head')
    list_data.append(ps)
    # add prairie
    pr = add_cost_per_unit(_sheet_name='Prairie', cost_per_acre=205.03, cost_per_unit=205.03, units='acre')
    list_data.append(pr)
    # add wetlands
    wet_r = add_cost_per_unit(_sheet_name='Wetland Restoration', cost_per_acre=312, cost_per_unit=312, units='acre')
    list_data.append(wet_r)
    # add Alfalfa hay
    ah = add_cost_per_unit(_sheet_name='Alfalfa Hay', cost_per_acre=554.75, cost_per_unit=84.8, units='Ton')
    list_data.append(ah)
    # add grass hay
    gh = add_cost_per_unit(_sheet_name='Grass Hay', cost_per_acre=602.73, cost_per_unit=63.45, units='Ton')
    list_data.append(gh)
    # add rotational grazing
    rot = add_cost_per_unit(_sheet_name='Rotational Grazing', cost_per_acre=None, cost_per_unit=3556, units='head')
    list_data.append(rot)
    #
    # # add conservation forestry
    # c_values = {'LU_ID': 11, 'Land-Use': 'Conservation Forestry', 'Sub Crop': None}
    # c_for = add_cost_per_unit(_sheet_name=c_values, cost_per_acre=None, cost_per_unit=0.79, units='acre')
    # list_data.append(c_for)
    # c_values = {'LU_ID': 12, 'Land-Use': 'Conventional Forestry', 'Sub Crop': None}
    # coFor = add_cost_per_unit(_sheet_name=c_values, cost_per_acre=0.79, cost_per_unit=None, units='acre')
    # list_data.append(coFor)
    out = pd.concat(list_data)
    out[['cost_per_acre', 'cost_per_unit']] = out[['cost_per_acre', 'cost_per_unit']].astype(float).round(decimals=2)
    unwanted_columns = ['cost_per_acre.1', 'total_cost.1', 'total_cost', 'Time - Cost Type',
                        'hl', 'hol', 'Total units', 'Note 1',
                        'Action - Cost Type', 'Total units'    'Note 1'
                        ]
    [out.drop(c, axis=1, inplace=True) for c in unwanted_columns if c in out.columns]
    out.to_csv('cost_per_unit.csv', index=False)
    view(out, table=False)


def main(book_path):
    # replicate the sheet
    copy_path = 'copy_' + book_path
    new_book = shutil.copy(book_path, copy_path)
    print(new_book)
    update_units(new_book)
    # return update_edits(new_book)


# Display the DataFrame
print(df)

if __name__ == '__main__':
    da = load_and_clean(view_in_excel=False)
    dc = df.dropna(subset='Time - Cost Type')
    dt = main(book_path='edited_budgets.xlsx')
