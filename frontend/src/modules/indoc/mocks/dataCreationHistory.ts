import type { ICreationHistoryID } from '../models/types'

export const dataCreationHistory: ICreationHistoryID[] = [
  {
    actionUser: {
      userId: '65b76774d9ec99dd51707193',
      username: 'nghhao@vimaru.edu.vn',
      fullName: 'Nguyễn Huy Hào',
      phone: '0912820901',
      gender: 'Male',
      positions: [{ title: 'Trưởng phòng', unit: 'Phòng Tổ chức - Hành chính' }]
    },
    createdAt: 1737690731427,
    unit: {
      unitId: '65b76776d9ec99dd517071cc',
      unitName: 'Phòng Tổ chức - Hành chính',
      shortName: 'TCHC',
      address: 'Hải Phòng',
      unitType: 'OrgClericalOffice'
    },
    type: 'Distribute',
    assignedUsers: [
      {
        actionUser: {
          username: 'dungnt@vimaru.edu.vn',
          fullName: 'Nguyễn Tiến Dũng',
          gender: 'Male',
          phone: '0904020211',
          userId: '65b76776d9ec99dd517071d3',
          positions: [
            {
              title: 'Phó Trưởng phòng',
              unit: 'Phòng Tổ chức - Hành chính'
            }
          ]
        },
        functionType: 'Reference'
      },
      {
        actionUser: {
          username: 'vtoanh@vimaru.edu.vn',
          fullName: 'Vũ Thị Oanh',
          dob: 'Mon Feb 09 1998 00:00:00 GMT+0700 (Indochina Time)',
          gender: 'Female',
          phone: '0914514292',
          userId: '65b76776d9ec99dd517071d9',
          positions: [
            {
              title: 'Văn thư',
              unit: 'Phòng Tổ chức - Hành chính'
            }
          ]
        },
        functionType: 'Reference'
      },
      {
        actionUser: {
          username: 'nguyenvanquang@vimaru.edu.vn',
          fullName: 'Nguyễn Văn Quảng',
          phone: '0974073013',
          userId: '65b76777d9ec99dd517071e8',
          positions: [
            {
              title: 'Phó Trưởng phòng',
              unit: 'Phòng Tổ chức - Hành chính'
            }
          ]
        },
        functionType: 'Reference'
      },
      {
        actionUser: {
          username: 'ducpv.yte@vimaru.edu.vn',
          fullName: 'Phan Viết Đức',
          degree: 'ThS',
          phone: '0904325125',
          userId: '65b76777d9ec99dd517071f9',
          positions: [
            {
              title: 'Bác sĩ chính',
              unit: 'Phòng Tổ chức - Hành chính'
            }
          ]
        },
        functionType: 'Reference'
      }
    ]
  }
]

export const dataCreationHistoryHmu: ICreationHistoryID[] = [
  {
    actionUser: {
      userId: '67760f5f2432fa92ea18f3d4',
      username: 'phamthuhuyen@hmu.edu.vn',
      positions: [
        {
          title: 'Văn thư',
          unit: 'Phòng Hành chính'
        }
      ],
      fullName: 'Phạm Thị Thu Huyền',
      degree: 'null'
    },
    createdAt: 1743563035791,
    unit: {
      unitId: '67760f5c2432fa92ea18f3ab',
      unitName: 'Phòng Hành chính',
      shortName: 'PHC',
      address: 'Hà Nội',
      unitType: 'OrgClericalOffice'
    },
    type: 'Create',
    assignedUsers: []
  },
  {
    actionUser: {
      userId: '67760ebc2432fa92ea18eac7',
      username: 'datvq@hmu.edu.vn',
      positions: [
        {
          title: 'Giảng viên chính (hạng II)',
          unit: 'Bộ môn Truyền nhiễm'
        },
        {
          title: 'Trưởng phòng',
          unit: 'Phòng Hành chính'
        },
        {
          title: 'Quản trị tổ chức',

          unit: 'Trường Đại học Y Hà Nội'
        }
      ],

      fullName: 'Vũ Quốc Đạt',
      degree: 'null'
    },
    createdAt: 1743563052647,

    unit: {
      unitName: 'Phòng Hành chính',
      shortName: 'PHC',
      address: 'Hà Nội',
      unitId: '67760f5c2432fa92ea18f3ab',
      unitType: 'OrgClericalOffice'
    },
    type: 'ProposalDistribute',
    assignedUsers: [
      {
        actionUser: {
          username: 'nguyenhuutu@hmu.edu.vn',
          fullName: 'Nguyễn Hữu Tú',
          degree: 'null',
          userId: '67760dc12432fa92ea18dddf',
          positions: [
            {
              title: 'Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'kimbaogiang@hmu.edu.vn',
          fullName: 'Kim Bảo Giang',
          degree: 'null',
          userId: '67760dc22432fa92ea18ddf1',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'tung@hmu.edu.vn',
          fullName: 'Lê Đình Tùng',
          degree: 'null',
          userId: '67760dc12432fa92ea18dde5',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'hokimthanh@hmu.edu.vn',
          fullName: 'Hồ Thị Kim Thanh',
          gender: 'Female',
          userId: '67760dc22432fa92ea18dde9',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'pxthang@hmu.edu.vn',

          fullName: 'Phạm Xuân Thắng',
          degree: 'null',
          userId: '67760dc22432fa92ea18dded',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'nguyenthuylinh@hmu.edu.vn',
          fullName: 'Nguyễn Thùy Linh',
          degree: 'null',
          userId: '67760f5d2432fa92ea18f3b8',
          positions: [
            {
              title: 'Thư ký',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        unitId: '67760dc32432fa92ea18ddf5',
        functionType: 'Host',
        unit: {
          unitId: '67760dc32432fa92ea18ddf5',
          unitName: 'Hội đồng Trường',
          shortName: 'HĐT',
          address: 'Hà Nội',
          unitType: 'BoardOfTrustees'
        }
      },
      {
        unitId: '67760dc62432fa92ea18de25',
        functionType: 'Reference',
        unit: {
          unitId: '67760dc62432fa92ea18de25',
          unitName: 'Công đoàn Trường',
          shortName: 'CĐT',
          unitType: 'UnionUnit'
        }
      }
    ]
  },
  {
    actionUser: {
      userId: '67760dc12432fa92ea18dddf',
      username: 'nguyenhuutu@hmu.edu.vn',
      positions: [
        {
          title: 'Hiệu trưởng',
          unit: 'Ban Giám hiệu'
        },
        {
          title: 'Trưởng BM',
          unit: 'Bộ môn Gây mê hồi sức'
        }
      ],
      fullName: 'Nguyễn Hữu Tú',
      degree: 'null'
    },
    createdAt: 1743563093221,
    unit: {
      unitName: 'Ban Giám hiệu',
      unitId: '67760dc12432fa92ea18ddd9',
      shortName: 'BGH',
      address: 'Hà Nội',
      unitType: 'RectorateBoard'
    },
    type: 'EvaluateDistribute',
    assignedUsers: [
      {
        actionUser: {
          username: 'nguyenhuutu@hmu.edu.vn',

          fullName: 'Nguyễn Hữu Tú',
          degree: 'null',
          userId: '67760dc12432fa92ea18dddf',
          positions: [
            {
              title: 'Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'kimbaogiang@hmu.edu.vn',
          fullName: 'Kim Bảo Giang',
          degree: 'null',
          userId: '67760dc22432fa92ea18ddf1',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'tung@hmu.edu.vn',
          fullName: 'Lê Đình Tùng',
          degree: 'null',
          userId: '67760dc12432fa92ea18dde5',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'hokimthanh@hmu.edu.vn',
          fullName: 'Hồ Thị Kim Thanh',
          gender: 'Female',
          userId: '67760dc22432fa92ea18dde9',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'pxthang@hmu.edu.vn',
          fullName: 'Phạm Xuân Thắng',
          degree: 'null',
          userId: '67760dc22432fa92ea18dded',
          positions: [
            {
              title: 'Phó Hiệu trưởng',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        actionUser: {
          username: 'nguyenthuylinh@hmu.edu.vn',
          fullName: 'Nguyễn Thùy Linh',
          degree: 'null',
          userId: '67760f5d2432fa92ea18f3b8',
          positions: [
            {
              title: 'Thư ký',
              unit: 'Ban Giám hiệu'
            }
          ]
        },
        functionType: 'Coordinator'
      },
      {
        unitId: '67760dc32432fa92ea18ddf5',
        functionType: 'Host',
        unit: {
          unitId: '67760dc32432fa92ea18ddf5',
          unitName: 'Hội đồng Trường',
          shortName: 'HĐT',
          address: 'Hà Nội',
          unitType: 'BoardOfTrustees'
        }
      },
      {
        unitId: '67760dc62432fa92ea18de25',
        functionType: 'Reference',
        unit: {
          unitId: '67760dc62432fa92ea18de25',
          unitName: 'Công đoàn Trường',
          shortName: 'CĐT',
          address: 'Hà Nội',
          unitType: 'UnionUnit'
        }
      }
    ]
  }
]
