import * as React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from "react-router-dom";
import { useTheme, Tooltip, Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Paper, IconButton, SvgIcon, Typography } from "@mui/material";


import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import TcaPlot from './TcaChart';
import LineChart from './LineChart';
import { conjunctionsList, manoeuvresList } from '../../assets/mappers';


function descendingComparator(a, b, orderBy) {
  // Função para acessar os valores com base em um caminho aninhado
  const getValueByPath = (obj, path) => path.split('.').reduce((acc, key) => acc[key], obj);

  // Comparação usando caminhos aninhados
  const orderByValueA = getValueByPath(a, orderBy);
  const orderByValueB = getValueByPath(b, orderBy);

  // Adicionar lógica específica para a coluna "tca"
  if (orderBy === 'tca') {
    const dateA = new Date(orderByValueA);
    const dateB = new Date(orderByValueB);
    const now = new Date();

    const isAFuture = dateA >= now;
    const isBFuture = dateB >= now;

    if (!isAFuture && isBFuture) {
      return -1;
    }
    if (isAFuture && !isBFuture) {
      return 1;
    }
    // Se ambos são futuros ou ambos são passados, ordena normalmente
    return dateB - dateA; // Para ordenação descendente
  }

  if (orderByValueB < orderByValueA) {
    return -1;
  }
  if (orderByValueB > orderByValueA) {
    return 1;
  }
  return 0;
}


function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'id',
    numeric: false,
    disablePadding: true,
    label: 'ID',
  },
  {
    id: 'satellite.name',
    numeric: false,
    disablePadding: false,
    label: 'Satellite',
  },
  {
    id: 'chaser.name',
    numeric: false,
    disablePadding: false,
    label: 'Chaser',
  },
  {
    id: 'tca',
    numeric: false,
    disablePadding: false,
    label: 'Time to TCA and Status',
  },
  {
    id: 'poc.latest',
    numeric: true,
    disablePadding: false,
    label: 'PoC Evolution',
  },
  {
    id: 'miss_distance.latest',
    numeric: true,
    disablePadding: false,
    label: 'Miss Distance Evolution',
  },
  {
    id: 'suggested_manoeuvres',
    numeric: true,
    disablePadding: false,
    label: 'Suggested Manoeuvres',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, isIdVisible, setIsIdVisible } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const createSeeIDHandler = (property) => (event) => {
    setIsIdVisible(!isIdVisible)
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            size={'small'}
            key={headCell.id}
            align={'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              padding: "14px",
              paddingLeft: headCell.id === "poc.latest" ? "28px" : "14px",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {headCell.id !== "id" && headCell.id !== "tca" && (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
            {headCell.id === "tca" && (
              <>
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                  <Tooltip title={
                    <>
                      <React.Fragment>
                        <Typography color="inherit" sx={{ fontSize: "11px", fontWeight: 500, marginBottom: "6px" }}>Time of closest approach and conjunction criticality classification</Typography>
                        <Box sx={{ display: "flex", alignContent: "center" }}>
                          <Box sx={(theme) => ({ backgroundColor: theme.palette.status.alarm, borderRadius: "50%", width: "15px", height: "15px", border: "3px solid #9B3751", marginRight: "4px" })}></Box>
                          <Typography color="inherit" sx={{ fontSize: "11px", fontWeight: 600 }}>Alarm</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignContent: "center", marginTop: "2px" }}>
                          <Box sx={(theme) => ({ backgroundColor: theme.palette.status.warning, borderRadius: "50%", width: "15px", height: "15px", border: "3px solid #A68027", marginRight: "4px" })}></Box>
                          <Typography color="inherit" sx={{ fontSize: "11px", fontWeight: 600 }}>Warning</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignContent: "center", marginTop: "2px" }}>
                          <Box sx={(theme) => ({ backgroundColor: theme.palette.status.ok, borderRadius: "50%", width: "15px", height: "15px", border: "3px solid #399457", marginRight: "4px" })}></Box>
                          <Typography color="inherit" sx={{ fontSize: "11px", fontWeight: 600 }}>Ok</Typography>
                        </Box>
                      </React.Fragment>
                    </>
                  }
                    PopperProps={{
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          maxWidth: '205px', // Remove o limite máximo padrão
                          //width: '300px', // Define a largura desejada
                        }
                      }
                    }}
                    arrow
                  >
                    <SvgIcon
                      sx={(theme) => ({
                        fontSize: "16px",
                        marginLeft: "5px",
                        color: theme.palette.primary.lightGrey, //"Time of closest approach and conjunction criticality classification"
                        '&:hover': {
                          color: theme.palette.text.primary, // Change to your desired hover color
                        },
                      })}
                    >
                      <InfoOutlinedIcon />
                    </SvgIcon>
                  </Tooltip>
                </TableSortLabel>

              </>
            )}
            {headCell.id === "id" && (
              <TableSortLabel
                active={true}
                onClick={createSeeIDHandler(headCell.id)}
                IconComponent={isIdVisible ? VisibilityOffIcon : VisibilityIcon}
                sx={{ paddingLeft: "8px" }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}

          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function ConjunctionsTable() {

  const navigate = useNavigate();

  const theme = useTheme();

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('tca');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, id) => {
    navigate(`${id}/manoeuvres`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - conjunctionsList.items.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(conjunctionsList.items, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage],
  );

  const [visibleId, setVisibleId] = useState(null); // Estado para controlar o ID visível

  const [isIdVisible, setIsIdVisible] = useState(false);

  const [activeCellId, setActiveCellId] = useState(null);

  const handleIDClick = (id) => {
    // Define o ID visível com base no ID clicado
    setVisibleId(visibleId === id ? null : id);
  };

  const toggleIcon = (id) => {
    setActiveCellId(id === activeCellId ? null : id);
  };

  const copyIDToClipboard = (id) => {
    // Cria um novo elemento de input
    const el = document.createElement('textarea');
    // Define o valor do input como o ID que você quer copiar
    el.value = id;
    // Adiciona o input ao DOM
    document.body.appendChild(el);
    // Seleciona o conteúdo do input
    el.select();
    // Copia o conteúdo selecionado para a área de transferência
    document.execCommand('copy');
    // Remove o input do DOM
    document.body.removeChild(el);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, backgroundColor: theme.palette.primary.main, backgroundImage: "unset", boxShadow: "none" }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={conjunctionsList.items.length}
              isIdVisible={isIdVisible} // Passando isIdVisible como propriedade
              setIsIdVisible={setIsIdVisible}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                const isFirstRow = index === 0;

                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                    sx={(theme) => ({ cursor: 'pointer', '&:hover #tca-chart-table-cell': { backgroundColor: theme.palette.plot.hover } })}
                  >
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      sx={{
                        //display: "flex",
                        alignItems: "center",
                        padding: "14px",
                        fontSize: "13px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="Show/Hide Manoeuvre ID" placement="top" arrow>
                        <IconButton sx={(theme) => ({ color: visibleId === row.id ? theme.palette.primary.active : theme.palette.primary.lightGrey, transition: "0.2s ease-in-out" })} onClick={() => handleIDClick(row.id)}>
                          <VisibilityIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                      </Tooltip>
                      {activeCellId === row.id ? (
                        <>
                          <Tooltip title="Copied" placement="top" arrow>
                            <IconButton
                              sx={(theme) => ({ color: theme.palette.primary.active, transition: "0.2s ease-in-out" })}
                              onClick={() => {
                                toggleIcon(row.id);
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="22" height="22" style={{ fill: theme.palette.primary.active, transition: "0.2s ease-in-out" }}>
                                <path d="M 16 1 H 4 c -1.1 0 -2 0.9 -2 2 v 14 h 2 V 3 h 12 z m 3 4 H 8 c -1.1 0 -2 0.9 -2 2 v 14 c 0 1.1 0.9 2 2 2 h 11 c 1.1 0 2 -0.9 2 -2 V 7 c 0 -1.1 -0.9 -2 -2 -2 m -6 13 L 13 18 Z L 9 15 L 10 14 L 13 16 L 17 10 L 18 11 z" />
                              </svg>
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Copy ID to clipboard" placement="top" arrow>
                          <IconButton
                            sx={(theme) => ({ color: theme.palette.primary.lightGrey, transition: "0.2s ease-in-out" })}
                            onClick={() => {
                              copyIDToClipboard(row.id);
                              toggleIcon(row.id);
                            }}
                          >
                            <ContentCopyTwoToneIcon sx={(theme) => ({ fontSize: 22, color: theme.palette.primary.lightGrey, "path": { opacity: "1" } })} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(isIdVisible || visibleId === row.id) &&
                        row.id
                      }

                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "13px", padding: "14px", whiteSpace: "nowrap" }}
                    >
                      {row.satellite.name ? (
                        <>
                          {row.satellite.name}
                          <br />
                          <span style={{ color: theme.palette.primary.darkGrey, fontSize: "11px" }}>
                            {row.satellite.id}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 16 16" width="16" height="16" fill='#FFB300' style={{ position: 'relative', top: '3.5px' }}>
                            <path d="M 0.64 13.44 h 14.08 L 7.68 1.28 z m 7.68 -1.92 h -1.28 v -1.28 h 1.28 z m 0 -2.56 h -1.28 v -2.56 h 1.28 z" />
                          </svg>
                          <span style={{ color: '#FFB300', marginLeft: "2px" }}>
                            Unknown
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "13px", padding: "14px", whiteSpace: "nowrap", paddingRight: "28px" }}
                    >
                      {row.chaser.name ? (
                        <>
                          {row.chaser.name}
                          <br />
                          <span style={{ color: theme.palette.primary.darkGrey, fontSize: "11px" }}>
                            {row.chaser.id}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 16 16" width="16" height="16" fill='#FFB300'>
                            <path d="M 0.64 13.44 h 14.08 L 7.68 1.28 z m 7.68 -1.92 h -1.28 v -1.28 h 1.28 z m 0 -2.56 h -1.28 v -2.56 h 1.28 z" />
                          </svg>
                          <span style={{ color: '#FFB300', position: 'relative', bottom: '3.5px', left: '2px' }}>
                            Unknown
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell
                      id='tca-chart-table-cell'
                      align="left"
                      sx={{ fontSize: "13px", padding: "0", backgroundColor: theme.palette.plot.background, borderLeft: "2px solid" + theme.palette.primary.darkGrey + "", borderRight: "2px solid" + theme.palette.primary.darkGrey + "", lineHeight: 0, width: "500px", '&:hover': { backgroundColor: theme.palette.plot.hover } }}
                    >
                      <TcaPlot
                        tca={row.tcaValue}
                        tcaLabel={row.tcaLabel}
                        status={row.status}
                        isFirstRow={isFirstRow}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontSize: "13px", padding: "8px 14px", width: "150px", lineHeight: 0, paddingLeft: "28px" }}
                    >
                      <div style={{ display: "flex", columnGap: "5px", alignItems: "center", width: "150px" }}>
                        <LineChart
                          evolution={row.poc.evolution}
                        />
                        <div style={{ display: "flex", flexDirection: "column", rowGap: "15px" }}>
                          <span style={{ color: theme.palette.primary.darkGrey, fontSize: "11px" }}>
                            Last Value
                          </span>
                          {row.poc.latestFormated || 'Undefined'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell
                      id='line-chart-table-cell'
                      align="left"
                      sx={{ fontSize: "13px", padding: "8px 14px", width: "150px", lineHeight: 0 }}
                    >
                      <div style={{ display: "flex", columnGap: "5px", alignItems: "center", width: "150px" }}>
                        <LineChart
                          evolution={row.miss_distance.evolution}
                        />
                        <div style={{ display: "flex", flexDirection: "column", rowGap: "15px" }}>
                          <span style={{ color: theme.palette.primary.darkGrey, fontSize: "11px" }}>
                            Last Value
                          </span>
                          {row.miss_distance.latestFormated + " m" || 'Undefined'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ width: "130px", fontSize: "13px", padding: "14px" }}>
                      {row.suggested_manoeuvres}
                      {manoeuvresList.items.some(maneuver => maneuver.conjunction_id === row.id) && (
                        <IconButton
                          sx={{ color: theme.palette.primary.active, transform: "rotate(-90deg)", marginLeft: "8px" }}
                          onClick={(event) => handleClick(event, row.id)}
                        >
                          <ExpandCircleDownIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[8, 16, 24]}
          component="div"
          count={conjunctionsList.items.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
